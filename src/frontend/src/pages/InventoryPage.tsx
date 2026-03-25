import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HttpAgent } from "@icp-sdk/core/agent";
import {
  Camera,
  Check,
  Edit2,
  Loader2,
  Plus,
  Search,
  ShirtIcon,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { ClothingItem } from "../backend.d";
import { useCamera } from "../camera/useCamera";
import { loadConfig } from "../config";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddClothingItem,
  useClothingItems,
  useDeleteClothingItem,
  useUpdateClothingItem,
  useWardrobeStats,
} from "../hooks/useQueries";
import { StorageClient } from "../utils/StorageClient";

const CATEGORIES = [
  "All",
  "Tops",
  "Bottoms",
  "Shoes",
  "Accessories",
  "Outerwear",
];
const SORT_OPTIONS = ["Newest", "Color", "Brand"];

const CATEGORY_COLORS: Record<string, string> = {
  Tops: "bg-blue-50 text-blue-700 border-blue-200",
  Bottoms: "bg-purple-50 text-purple-700 border-purple-200",
  Shoes: "bg-amber-50 text-amber-700 border-amber-200",
  Accessories: "bg-rose-50 text-rose-700 border-rose-200",
  Outerwear: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

type ExtendedItem = ClothingItem & { sampleImage?: string };

const SAMPLE_ITEMS: ExtendedItem[] = [
  {
    id: "s1",
    name: "Classic White Shirt",
    category: "Tops",
    color: "White",
    brand: "Uniqlo",
    tags: ["casual", "office"],
    blobId: "",
    createdAt: BigInt(Date.now()),
    userId: "",
    sampleImage: "/assets/generated/item-white-shirt.dim_400x400.jpg",
  },
  {
    id: "s2",
    name: "Navy Slim Trousers",
    category: "Bottoms",
    color: "Navy",
    brand: "Zara",
    tags: ["office", "formal"],
    blobId: "",
    createdAt: BigInt(Date.now()),
    userId: "",
    sampleImage: "/assets/generated/item-navy-trousers.dim_400x400.jpg",
  },
  {
    id: "s3",
    name: "White Leather Sneakers",
    category: "Shoes",
    color: "White",
    brand: "Adidas",
    tags: ["casual", "sport"],
    blobId: "",
    createdAt: BigInt(Date.now()),
    userId: "",
    sampleImage: "/assets/generated/item-white-sneakers.dim_400x400.jpg",
  },
  {
    id: "s4",
    name: "Camel Wool Blazer",
    category: "Outerwear",
    color: "Camel",
    brand: "H&M",
    tags: ["office", "formal"],
    blobId: "",
    createdAt: BigInt(Date.now()),
    userId: "",
    sampleImage: "/assets/generated/item-beige-blazer.dim_400x400.jpg",
  },
  {
    id: "s5",
    name: "Black Leather Bag",
    category: "Accessories",
    color: "Black",
    brand: "Coach",
    tags: ["everyday"],
    blobId: "",
    createdAt: BigInt(Date.now()),
    userId: "",
    sampleImage: "/assets/generated/item-black-bag.dim_400x400.jpg",
  },
  {
    id: "s6",
    name: "Olive Cashmere Sweater",
    category: "Tops",
    color: "Olive",
    brand: "COS",
    tags: ["casual", "cozy"],
    blobId: "",
    createdAt: BigInt(Date.now()),
    userId: "",
    sampleImage: "/assets/generated/item-olive-sweater.dim_400x400.jpg",
  },
];

interface ItemFormData {
  name: string;
  category: string;
  color: string;
  brand: string;
  tags: string;
  blobId: string;
  previewUrl: string;
}

const DEFAULT_FORM: ItemFormData = {
  name: "",
  category: "Tops",
  color: "",
  brand: "",
  tags: "",
  blobId: "",
  previewUrl: "",
};

function LoginPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <ShirtIcon className="w-10 h-10 text-primary" />
      </div>
      <h2 className="font-display text-3xl font-bold text-foreground mb-3">
        Your Wardrobe Awaits
      </h2>
      <p className="text-muted-foreground max-w-md mb-8 text-base">
        Sign in to manage your personal clothing inventory and get AI outfit
        suggestions.
      </p>
      <Button
        size="lg"
        onClick={onLogin}
        className="bg-primary hover:bg-primary/90 text-white rounded-full px-10"
        data-ocid="inventory.login.button"
      >
        Sign In to Continue
      </Button>
      <p className="text-muted-foreground text-sm mt-4">
        Preview below shows sample wardrobe items
      </p>
    </div>
  );
}

export default function InventoryPage() {
  const { login, identity } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: items = [], isLoading } = useClothingItems();
  const { data: stats } = useWardrobeStats();
  const addItem = useAddClothingItem();
  const updateItem = useUpdateClothingItem();
  const deleteItem = useDeleteClothingItem();

  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExtendedItem | null>(null);
  const [form, setForm] = useState<ItemFormData>(DEFAULT_FORM);
  const [isUploading, setIsUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const camera = useCamera({ facingMode: "environment" });

  const displayItems: ExtendedItem[] = isLoggedIn ? items : SAMPLE_ITEMS;

  const filteredItems = displayItems
    .filter(
      (item) => activeCategory === "All" || item.category === activeCategory,
    )
    .filter(
      (item) =>
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "Newest") return Number(b.createdAt - a.createdAt);
      if (sortBy === "Color") return a.color.localeCompare(b.color);
      if (sortBy === "Brand") return a.brand.localeCompare(b.brand);
      return 0;
    });

  const openAddModal = () => {
    setEditingItem(null);
    setForm(DEFAULT_FORM);
    setShowCamera(false);
    setModalOpen(true);
  };
  const openEditModal = (item: ExtendedItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      color: item.color,
      brand: item.brand,
      tags: item.tags.join(", "),
      blobId: item.blobId,
      previewUrl: item.sampleImage || "",
    });
    setShowCamera(false);
    setModalOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    if (!identity) {
      toast.error("Please sign in to upload photos");
      return;
    }
    setIsUploading(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      setForm((f) => ({ ...f, previewUrl }));
      const cfg = await loadConfig();
      const agent = HttpAgent.createSync({ identity });
      const storageClient = new StorageClient(
        cfg.bucket_name,
        cfg.storage_gateway_url,
        cfg.backend_canister_id,
        cfg.project_id,
        agent,
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);
      setForm((f) => ({ ...f, blobId: hash }));
      toast.success("Photo uploaded!");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCapturePhoto = async () => {
    const file = await camera.capturePhoto();
    if (file) {
      setShowCamera(false);
      camera.stopCamera();
      await handleFileUpload(file);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category) {
      toast.error("Name and category are required");
      return;
    }
    const tagsArr = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      if (editingItem && !editingItem.id.startsWith("s")) {
        await updateItem.mutateAsync({
          id: editingItem.id,
          name: form.name,
          category: form.category,
          color: form.color,
          brand: form.brand,
          tags: tagsArr,
          blobId: form.blobId,
        });
        toast.success("Item updated!");
      } else {
        await addItem.mutateAsync({
          name: form.name,
          category: form.category,
          color: form.color,
          brand: form.brand,
          tags: tagsArr,
          blobId: form.blobId,
        });
        toast.success("Item added to wardrobe!");
      }
      setModalOpen(false);
    } catch {
      toast.error("Failed to save item");
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith("s")) {
      toast.info("Sign in to manage your own items");
      return;
    }
    try {
      await deleteItem.mutateAsync(id);
      toast.success("Item removed");
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const closeModal = () => {
    camera.stopCamera();
    setShowCamera(false);
    setModalOpen(false);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground">
                My Digital Wardrobe
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage and organize your clothing collection
              </p>
            </div>
            {isLoggedIn && (
              <Button
                onClick={openAddModal}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl"
                data-ocid="inventory.add_item.button"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            )}
          </div>
          {isLoggedIn && stats && (
            <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[
                { label: "Total", value: stats.total },
                { label: "Tops", value: stats.tops },
                { label: "Bottoms", value: stats.bottoms },
                { label: "Shoes", value: stats.shoes },
                { label: "Accessories", value: stats.accessories },
                { label: "Outerwear", value: stats.outerwear },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-background rounded-xl p-3 text-center border border-border"
                >
                  <div className="font-display text-2xl font-bold text-foreground">
                    {s.value.toString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {!isLoggedIn && <LoginPrompt onLogin={login} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside
            className="w-full lg:w-56 flex-shrink-0"
            data-ocid="inventory.panel"
          >
            <div className="bg-card rounded-2xl border border-border p-5 sticky top-24">
              <h3 className="font-semibold text-xs text-muted-foreground mb-4 uppercase tracking-wider">
                Categories
              </h3>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    data-ocid="inventory.category.tab"
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activeCategory === cat
                        ? "bg-primary text-white font-medium"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="mt-6">
                <h3 className="font-semibold text-xs text-muted-foreground mb-3 uppercase tracking-wider">
                  Sort By
                </h3>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger
                    className="bg-background"
                    data-ocid="inventory.sort.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-card border-border rounded-xl"
                data-ocid="inventory.search_input"
              />
            </div>

            {isLoading ? (
              <div
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                data-ocid="inventory.loading_state"
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i.toString()} className="h-64 rounded-2xl" />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 text-center"
                data-ocid="inventory.empty_state"
              >
                <ShirtIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  No items found
                </h3>
                <p className="text-muted-foreground text-sm">
                  {isLoggedIn
                    ? "Add your first clothing item to get started"
                    : "Sign in to add your own items"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    data-ocid={`inventory.item.${idx + 1}`}
                  >
                    <ItemCard
                      item={item}
                      onEdit={() => openEditModal(item)}
                      onDelete={() => handleDelete(item.id)}
                      isDeleting={deleteItem.isPending}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
          else setModalOpen(true);
        }}
      >
        <DialogContent className="max-w-md" data-ocid="inventory.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingItem ? "Edit Item" : "Add New Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium">Photo</Label>
              <div className="mt-2">
                {showCamera ? (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                    <video
                      ref={camera.videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={camera.canvasRef} className="hidden" />
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                      <Button
                        size="sm"
                        onClick={handleCapturePhoto}
                        className="bg-white text-foreground hover:bg-white/90 rounded-full px-6"
                        data-ocid="inventory.capture.button"
                      >
                        <Camera className="w-4 h-4 mr-1" /> Capture
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowCamera(false);
                          camera.stopCamera();
                        }}
                        className="rounded-full bg-white/20 border-white/40 text-white"
                        data-ocid="inventory.camera_close.button"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : form.previewUrl ? (
                  <div className="relative">
                    <img
                      src={form.previewUrl}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setForm((f) => ({ ...f, previewUrl: "", blobId: "" }))
                      }
                      className="absolute top-2 right-2 w-7 h-7 p-0 rounded-full"
                      data-ocid="inventory.photo_clear.button"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-3"
                    data-ocid="inventory.dropzone"
                  >
                    {isUploading ? (
                      <div
                        className="flex items-center gap-2"
                        data-ocid="inventory.upload.loading_state"
                      >
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Uploading...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowCamera(true);
                              camera.startCamera();
                            }}
                            className="rounded-lg"
                            data-ocid="inventory.camera.button"
                          >
                            <Camera className="w-4 h-4 mr-1" /> Camera
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-lg"
                            data-ocid="inventory.upload_button"
                          >
                            <Upload className="w-4 h-4 mr-1" /> Upload
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG or WEBP
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileUpload(f);
                          }}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="item-name" className="text-sm">
                  Name *
                </Label>
                <Input
                  id="item-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="White T-Shirt"
                  className="mt-1"
                  data-ocid="inventory.name.input"
                />
              </div>
              <div>
                <Label className="text-sm">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="inventory.category.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="item-color" className="text-sm">
                  Color
                </Label>
                <Input
                  id="item-color"
                  value={form.color}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, color: e.target.value }))
                  }
                  placeholder="Navy Blue"
                  className="mt-1"
                  data-ocid="inventory.color.input"
                />
              </div>
              <div>
                <Label htmlFor="item-brand" className="text-sm">
                  Brand
                </Label>
                <Input
                  id="item-brand"
                  value={form.brand}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, brand: e.target.value }))
                  }
                  placeholder="Zara"
                  className="mt-1"
                  data-ocid="inventory.brand.input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="item-tags" className="text-sm">
                Tags (comma-separated)
              </Label>
              <Input
                id="item-tags"
                value={form.tags}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tags: e.target.value }))
                }
                placeholder="casual, office, summer"
                className="mt-1"
                data-ocid="inventory.tags.input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={closeModal}
              data-ocid="inventory.cancel.button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                addItem.isPending || updateItem.isPending || isUploading
              }
              className="bg-primary hover:bg-primary/90 text-white"
              data-ocid="inventory.save.button"
            >
              {addItem.isPending || updateItem.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {editingItem ? "Update" : "Add Item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ItemCard({
  item,
  onEdit,
  onDelete,
  isDeleting,
}: {
  item: ExtendedItem;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const badgeClass =
    CATEGORY_COLORS[item.category] ||
    "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all group">
      <div className="aspect-square bg-secondary relative overflow-hidden">
        {item.sampleImage ? (
          <img
            src={item.sampleImage}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : item.blobId ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            Photo uploaded
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">
              {{
                Tops: "\u{1F455}",
                Bottoms: "\u{1F456}",
                Shoes: "\u{1F45F}",
                Accessories: "\u{1F45C}",
                Outerwear: "\u{1F9E5}",
              }[item.category] || "\u{1F457}"}
            </span>
            <span className="text-xs text-muted-foreground">
              {item.category}
            </span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span
            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${badgeClass}`}
          >
            {item.category}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h3
          className="font-semibold text-sm text-foreground truncate"
          title={item.name}
        >
          {item.name}
        </h3>
        <div className="flex items-center gap-1 mt-0.5">
          {item.color && (
            <span className="text-xs text-muted-foreground">{item.color}</span>
          )}
          {item.brand && item.color && (
            <span className="text-xs text-muted-foreground">·</span>
          )}
          {item.brand && (
            <span className="text-xs text-muted-foreground">{item.brand}</span>
          )}
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            className="flex-1 h-8 text-xs rounded-lg border-border"
            data-ocid="inventory.edit_button"
          >
            <Edit2 className="w-3 h-3 mr-1" /> Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            disabled={isDeleting}
            className="flex-1 h-8 text-xs rounded-lg border-border text-destructive hover:bg-destructive hover:text-white hover:border-destructive"
            data-ocid="inventory.delete_button"
          >
            <Trash2 className="w-3 h-3 mr-1" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
