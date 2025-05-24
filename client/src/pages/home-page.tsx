import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Dashboard } from "@/components/dashboard";
import { InventoryView } from "@/components/inventory-view";
import { AddProductForm } from "@/components/add-product-form";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

type View = "dashboard" | "inventory" | "add-product";

export default function HomePage() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "inventory":
        return <InventoryView onAddProduct={() => setCurrentView("add-product")} />;
      case "add-product":
        return <AddProductForm onCancel={() => setCurrentView("inventory")} onSuccess={() => setCurrentView("inventory")} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {renderView()}
        </div>
      </div>
    </div>
  );
}
