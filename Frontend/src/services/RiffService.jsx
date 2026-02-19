const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + "/riff";

class RiffService {
  async uploadRecording(audioBlob) {
    if (!audioBlob) {
      throw new Error("No recording provided");
    }

    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return await response.json();
  }

  async getAllRiffs() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_BASE_URL}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export default new RiffService();
