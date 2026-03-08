const API_USERS_URL = import.meta.env.VITE_API_BASE_URL + "/users";

const getToken = () => localStorage.getItem("token");

export const getCurrentUser = () => {
  const token = getToken();
  const userId = localStorage.getItem("userId");
  if (!token || !userId) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: userId,
      username: payload.unique_name,
      email: payload.email,
    };
  } catch {
    return null;
  }
};

class UserService {
  async getById(userId) {
    const token = getToken();
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${API_USERS_URL}/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }
}

export default new UserService();