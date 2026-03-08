using Microsoft.AspNetCore.Mvc;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RiffController : ControllerBase
    {
        private readonly IRiffService _service;
        private readonly BlobStorageService _blobService;

        public RiffController(IRiffService service, BlobStorageService blobService)
        {
            _service     = service;
            _blobService = blobService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var riffs = await _service.GetAllAsync();
            return Ok(riffs);
        }

        [HttpGet("trending")]
        public async Task<IActionResult> GetTrending([FromQuery] int top = 20)
        {
            var riffs = await _service.GetTrendingAsync(top);
            return Ok(riffs);
        }

        [HttpGet("user/{userId:guid}")]
        [Authorize]
        public async Task<IActionResult> GetByUser(Guid userId)
        {
            var riffs = await _service.GetByUserIdAsync(userId);
            return Ok(riffs);
        }

        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            var riff = await _service.GetByIdAsync(id);
            if (riff == null) return NotFound();
            return Ok(riff);
        }

        [HttpGet("{id:guid}/stream")]
        [Authorize]
        public async Task<IActionResult> Stream(Guid id)
        {
            var riff = await _service.GetByIdAsync(id);
            if (riff == null) return NotFound();

            var (stream, contentType) = await _blobService.DownloadAsync(riff.Url);
            return File(stream, contentType, enableRangeProcessing: true);
        }

        [HttpPost("upload")]
        [Authorize]
        [RequestSizeLimit(52_428_800)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Upload([FromForm] IFormFile file)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized("Invalid token.");

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            string url;
            try
            {
                url = await _blobService.UploadAsync(file, userId.Value);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }

            var riff = new Riff
            {
                UserId    = userId.Value,
                Url       = url,
                CreatedAt = DateTime.UtcNow,
            };

            var saved = await _service.AddAsync(riff);
            return Ok(new { riffId = saved.Id, url = saved.Url });
        }

        [HttpPut("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, Riff riff)
        {
            var updated = await _service.UpdateAsync(id, riff);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized("Invalid token.");

            var riff = await _service.GetByIdAsync(id);
            if (riff == null) return NotFound();

            if (riff.UserId != userId.Value)
                return Forbid();

            if (!string.IsNullOrEmpty(riff.Url))
                await _blobService.DeleteAsync(riff.Url, userId.Value);

            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();

            return NoContent();
        }

        private Guid? GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                     ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);

            return claim != null && Guid.TryParse(claim.Value, out var id) ? id : null;
        }
    }
}