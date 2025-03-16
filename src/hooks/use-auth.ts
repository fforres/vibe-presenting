import { useState, useEffect } from "react";

// This is our "secret" login value - in a real app, this would be handled securely
const META_LOGIN_VALUE = "vibe_presenting_secret_key_1997";
const AUTH_STORAGE_KEY = "vibe_presenting_auth";
const USERNAME_STORAGE_KEY = "vibe_presenting_username";
const USER_ID_STORAGE_KEY = "vibe_presenting_user_id";
const ADMIN_ID = "fforres";

export function useAuth() {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [username, setUsername] = useState<string>("");
	const [userId, setUserId] = useState<string>("");

	// Initialize auth state from localStorage on component mount
	useEffect(() => {
		// Set the meta login value in localStorage if it doesn't exist
		if (!localStorage.getItem("metalogin")) {
			localStorage.setItem("metalogin", META_LOGIN_VALUE);
		}

		const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
		const storedUsername = localStorage.getItem(USERNAME_STORAGE_KEY);
		const storedUserId = localStorage.getItem(USER_ID_STORAGE_KEY);

		if (storedAuth === "true" && storedUsername) {
			setIsAdmin(storedUsername === "fforres");
			setIsLoggedIn(true);
			setUsername(storedUsername);
			setUserId(storedUserId || "");
		}
	}, []);

	// Generate a unique user ID
	const generateUserId = (): string => {
		return Date.now().toString(36) + Math.random().toString(36).substring(2);
	};

	const login = (inputUsername: string) => {
		const metaLoginValue = localStorage.getItem("metalogin");

		// For demo purposes, we're considering the user logged in if:
		// 1. They enter any username (not empty)
		// 2. OR they enter the exact meta login value
		if (
			inputUsername &&
			(inputUsername.trim() !== "" || inputUsername === metaLoginValue)
		) {
			// Check if user already has an ID, if not create one
			let userUniqueId = localStorage.getItem(USER_ID_STORAGE_KEY);
			if (!userUniqueId) {
				userUniqueId = generateUserId();
				localStorage.setItem(USER_ID_STORAGE_KEY, userUniqueId);
			}

			localStorage.setItem(AUTH_STORAGE_KEY, "true");
			localStorage.setItem(USERNAME_STORAGE_KEY, inputUsername);
			setIsLoggedIn(true);
			setUsername(inputUsername);
			setUserId(userUniqueId);
			return true;
		}
		return false;
	};

	const logout = () => {
		localStorage.removeItem(AUTH_STORAGE_KEY);
		localStorage.removeItem(USERNAME_STORAGE_KEY);
		// Note: We don't remove the user ID on logout to maintain persistence
		setIsLoggedIn(false);
		setUsername("");
		// We don't reset userId state to keep it in memory
	};

	return {
		isLoggedIn,
		isAdmin,
		username,
		userId,
		login,
		logout,
	};
}
