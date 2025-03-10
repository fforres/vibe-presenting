import { Routes } from "react-router";

import { Index } from "@/routes/index";
import { Route } from "react-router";

export const AllRoutes = () => {
	return (
		<Routes>
			<Route path="/" element={<Index />} />
		</Routes>
	);
};
