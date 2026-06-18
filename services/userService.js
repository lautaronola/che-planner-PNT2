import {
  METHODS,
  SEARCH_USERS_URL,
  SEARCH_USERS_ERROR,
} from "../constants/index";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const searchUsers = async (query, token) => {
  try {
    const url = `${BASE_URL}${SEARCH_USERS_URL}?search=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      method: METHODS.GET,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || SEARCH_USERS_ERROR);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

export default { searchUsers };
