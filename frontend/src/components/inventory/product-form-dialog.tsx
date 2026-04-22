"use client"

import * as React from "react"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface ProductFormData {
  name: string
  sku: string
  barcode: string
  category: string
  price: string
  cost: string
  stock: string
  threshold: string
  description: string
  unit_type: string
}

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingProduct?: any | null
}

const categories = [
  "Electronics",
  "Accessories",
  "Clothing",
  "Stationery",
  "Home & Living",
  "Food & Beverages",
  "Health & Beauty",
  "Others"
]

export function ProductFormDialog({ open, onOpenChange, editingProduct }: ProductFormDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = React.useState<ProductFormData>({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    price: "",
    cost: "",
    stock: "",
    threshold: "",
    description: "",
    unit_type: "pcs",
  })

  React.useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || "",
        sku: editingProduct.sku || "",
        barcode: editingProduct.barcode || "",
        category: editingProduct.category || "",
        price: editingProduct.price?.toString() || "",
        cost: editingProduct.cost?.toString() || "",
        stock: editingProduct.stock?.toString() || "",
        threshold: editingProduct.threshold?.toString() || "",
        description: editingProduct.description || "",
        unit_type: editingProduct.unit_type || "pcs",
      })
    } else {
      setFormData({
        name: "",
        sku: "",
        barcode: "",
        category: "",
        price: "",
        cost: "",
        stock: "",
        threshold: "",
        description: "",
        unit_type: "pcs",
      })
    }
  }, [editingProduct, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.sku || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: editingProduct ? "Product Updated" : "Product Created",
      description: `${formData.name} has been ${editingProduct ? "updated" : "added"} successfully.`,
    })
    onOpenChange(false)
  }

  const handleChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {editingProduct ? "Update product information" : "Fill in the details to add a new product"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  placeholder="e.g., WMS-001"
                  value={formData.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  placeholder="Scan or enter barcode"
                  value={formData.barcode}
                  onChange={(e) => handleChange("barcode", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost Price (₹)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) => handleChange("cost", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Current Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="threshold">Low Stock Alert Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  placeholder="10"
                  value={formData.threshold}
                  onChange={(e) => handleChange("threshold", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit Type</Label>
                <Select 
                  value={formData.unit_type} 
                  onValueChange={(value) => handleChange("unit_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="g">Grams (g)</SelectItem>
                    <SelectItem value="l">Liters (l)</SelectItem>
                    <SelectItem value="ml">Milliliters (ml)</SelectItem>
                    <SelectItem value="m">Meters (m)</SelectItem>
                    <SelectItem value="box">Boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Product description (optional)"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
