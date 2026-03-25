import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import InventoryPage from "./pages/InventoryPage";
import OutfitsPage from "./pages/OutfitsPage";

export type Page = "home" | "inventory" | "outfits";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const navigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout currentPage={currentPage} navigate={navigate}>
      {currentPage === "home" && <HomePage navigate={navigate} />}
      {currentPage === "inventory" && <InventoryPage />}
      {currentPage === "outfits" && <OutfitsPage />}
      <Toaster position="top-right" richColors />
    </Layout>
  );
}
