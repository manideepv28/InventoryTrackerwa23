import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, DollarSign, AlertTriangle, Tags } from "lucide-react";
import type { Product } from "@shared/schema";

const LOW_STOCK_THRESHOLD = 5;

export function Dashboard() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-2">Overview of your inventory performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.stock * parseFloat(p.purchasePrice)), 0);
  const lowStockItems = products.filter(p => p.stock < LOW_STOCK_THRESHOLD && p.stock > 0);
  const adequateStockItems = products.filter(p => p.stock >= LOW_STOCK_THRESHOLD);
  const outOfStockItems = products.filter(p => p.stock === 0);
  const categories = [...new Set(products.map(p => p.category))];
  
  const totalWithStock = products.filter(p => p.stock > 0).length;
  const adequatePercentage = totalWithStock > 0 ? (adequateStockItems.length / totalWithStock) * 100 : 0;
  const lowStockPercentage = totalWithStock > 0 ? (lowStockItems.length / totalWithStock) * 100 : 0;

  const topStockItems = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);

  const allLowStock = products.filter(p => p.stock < LOW_STOCK_THRESHOLD);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-2">Overview of your inventory performance</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-red-600">{lowStockItems.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Tags className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Level Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Stock Level Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-600 rounded mr-3"></div>
                <span className="text-gray-700">Adequate Stock (≥5)</span>
              </div>
              <span className="font-semibold text-gray-900">{adequateStockItems.length}</span>
            </div>
            <Progress value={adequatePercentage} className="h-2" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-600 rounded mr-3"></div>
                <span className="text-gray-700">Low Stock (&lt;5)</span>
              </div>
              <span className="font-semibold text-gray-900">{lowStockItems.length}</span>
            </div>
            <Progress value={lowStockPercentage} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Stock Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topStockItems.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{product.stock}</p>
                  <p className="text-xs text-gray-600">units</p>
                </div>
              </div>
            ))}
            {topStockItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No products found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {allLowStock.length > 0 ? (
            allLowStock.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">{product.stock} units</p>
                  <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>
                    {product.stock === 0 ? "Out of Stock" : "Low Stock"}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <p>No low stock alerts!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
