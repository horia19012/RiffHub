using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace api.Services
{
    public class BlobStorageService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly string _containerName;

        private const long MaxFileSizeBytes = 50 * 1024 * 1024;

        public BlobStorageService(string connectionString, string containerName)
        {
            if (string.IsNullOrEmpty(connectionString))
                throw new ArgumentException("Connection string cannot be null");
            if (string.IsNullOrEmpty(containerName))
                throw new ArgumentException("Container name cannot be null");

            _containerName = containerName;
            _blobServiceClient = new BlobServiceClient(connectionString);
        }

        public async Task<string> UploadAsync(IFormFile file, Guid userId)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("No file provided.");
            if (file.Length > MaxFileSizeBytes)
                throw new ArgumentException($"File exceeds the {MaxFileSizeBytes / (1024 * 1024)} MB limit.");

            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);

            var blobName   = $"{userId}/{Guid.NewGuid()}.webm";
            var blobClient = containerClient.GetBlobClient(blobName);

            var headers = new BlobHttpHeaders
            {
                ContentType        = "audio/webm",
                CacheControl       = "public, max-age=31536000, immutable",
                ContentDisposition = "inline",
            };

            var metadata = new Dictionary<string, string>
            {
                ["userId"]       = userId.ToString(),
                ["originalName"] = SanitizeMetadataValue(file.FileName),
                ["uploadedAt"]   = DateTime.UtcNow.ToString("O"),
            };

            using var stream = file.OpenReadStream();

            await blobClient.UploadAsync(stream, new BlobUploadOptions
            {
                HttpHeaders = headers,
                Metadata    = metadata,
            });

            return blobClient.Uri.ToString();
        }

        public async Task<(Stream stream, string contentType)> DownloadAsync(string blobUri)
        {
            var blobName   = ExtractBlobName(blobUri);
            var blobClient = _blobServiceClient
                                .GetBlobContainerClient(_containerName)
                                .GetBlobClient(blobName);

            var response    = await blobClient.DownloadStreamingAsync();
            var contentType = response.Value.Details.ContentType ?? "audio/webm";
            return (response.Value.Content, contentType);
        }

        public async Task<bool> DeleteAsync(string blobUri, Guid userId)
        {
            var blobName = ExtractBlobName(blobUri);

            if (!blobName.StartsWith($"{userId}/", StringComparison.OrdinalIgnoreCase))
                return false;

            var blobClient = _blobServiceClient
                                .GetBlobContainerClient(_containerName)
                                .GetBlobClient(blobName);

            var response = await blobClient.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots);
            return response.Value;
        }

        private string ExtractBlobName(string blobUri)
        {
            if (!Uri.TryCreate(blobUri, UriKind.Absolute, out var uri))
                throw new ArgumentException($"Invalid blob URI: {blobUri}");

            return Uri.UnescapeDataString(uri.AbsolutePath)
                      .TrimStart('/')
                      .Substring(_containerName.Length)
                      .TrimStart('/');
        }

        private static string SanitizeMetadataValue(string value)
        {
            if (string.IsNullOrEmpty(value)) return string.Empty;
            return new string(value.Where(c => c < 128 && c != '\n' && c != '\r').ToArray())
                       .Trim()[..Math.Min(value.Length, 256)];
        }
    }
}