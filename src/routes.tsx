import { Routes } from "react-router";
import { Index } from "@/routes/index";
import { Route } from "react-router";
import { SinglePresentation } from "@/routes/single-presentation";
import { Toaster } from "@/components/ui/sonner";

export const AllRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="presentation/:id" element={<SinglePresentation />} />
      </Routes>
      <Toaster />
    </>
  );
};
