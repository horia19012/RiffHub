const API_BASE_URL      = import.meta.env.VITE_API_BASE_URL + "/riff";
const API_USERS_URL     = import.meta.env.VITE_API_BASE_URL + "/users";
const API_REACTIONS_URL = import.meta.env.VITE_API_BASE_URL + "/reaction";

const getToken = () => localStorage.getItem("token");

export const getStreamUrl = (riffId) =>
  `${API_BASE_URL}/${riffId}/stream?token=${getToken()}`;

class RiffService {
  async uploadRecording(audioBlob) {
    if (!audioBlob) throw new Error("No recording provided");
    const token = getToken();
    if (!token) throw new Error("You must be logged in to upload");

    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Upload failed");
    }
    return await response.json();
  }

  async getAllRiffs() {
    const token = getToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_BASE_URL}`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }

  async getTrending(top = 20) {
    const response = await fetch(`${API_BASE_URL}/trending?top=${top}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }

  async getRiffsByUser(userId) {
    const token = getToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }

  async deleteRiff(id) {
    const token = getToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
    return true;
  }

  async getUserById(userId) {
    const token = getToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_USERS_URL}/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }

  async reactToRiff(riffId, type) {
    const token = getToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_REACTIONS_URL}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ riffId, type }),
    });
    if (!response.ok) throw new Error(`React failed: ${response.status}`);
    return await response.json();
  }
}

export default new RiffService();