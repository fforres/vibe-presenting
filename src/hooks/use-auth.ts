import { useState, useEffect } from "react";

// This is our "secret" login value - in a real app, this would be handled securely
const META_LOGIN_VALUE = "vibe_presenting_secret_key_1997";
const AUTH_STORAGE_KEY = "vibe_presenting_auth";
const USERNAME_STORAGE_KEY = "vibe_presenting_username";

export function useAuth() {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [username, setUsername] = useState<string>("");

	// Initialize auth state from localStorage on component mount
	useEffect(() => {
		// Set the meta login value in localStorage if it doesn't exist
		if (!localStorage.getItem("metalogin")) {
			localStorage.setItem("metalogin", META_LOGIN_VALUE);
		}

		const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
		const storedUsername = localStorage.getItem(USERNAME_STORAGE_KEY);

		if (storedAuth === "true" && storedUsername) {
			setIsAdmin(storedUsername === "fforres");
			setIsLoggedIn(true);
			setUsername(storedUsername);
		}
	}, []);

	const login = (inputUsername: string) => {
		const metaLoginValue = localStorage.getItem("metalogin");

		// For demo purposes, we're considering the user logged in if:
		// 1. They enter any username (not empty)
		// 2. OR they enter the exact meta login value
		if (
			inputUsername &&
			(inputUsername.trim() !== "" || inputUsername === metaLoginValue)
		) {
			localStorage.setItem(AUTH_STORAGE_KEY, "true");
			localStorage.setItem(USERNAME_STORAGE_KEY, inputUsername);
			setIsLoggedIn(true);
			setUsername(inputUsername);
			return true;
		}
		return false;
	};

	const logout = () => {
		localStorage.removeItem(AUTH_STORAGE_KEY);
		localStorage.removeItem(USERNAME_STORAGE_KEY);
		setIsLoggedIn(false);
		setUsername("");
	};

	return {
		isLoggedIn,
		isAdmin,
		username,
		login,
		logout,
	};
}
