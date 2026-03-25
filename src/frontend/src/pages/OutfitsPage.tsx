import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Cloud,
  Heart,
  Loader2,
  ShirtIcon,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ClothingItem, OutfitSuggestion } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddOutfit,
  useClothingItems,
  useDeleteOutfit,
  useOutfits,
  useSuggestOutfits,
} from "../hooks/useQueries";

const OCCASIONS = ["Casual", "Work", "Date Night", "Formal", "Sport"];

const OCCASION_COLORS: Record<string, string> = {
  Casual: "bg-blue-50 text-blue-700 border-blue-200",
  Work: "bg-violet-50 text-violet-700 border-violet-200",
  "Date Night": "bg-rose-50 text-rose-700 border-rose-200",
  Formal: "bg-slate-50 text-slate-700 border-slate-200",
  Sport: "bg-green-50 text-green-700 border-green-200",
};

const SAMPLE_ITEMS: ClothingItem[] = [
  {
    id: "s1",
    name: "Classic White Shirt",
    category: "Tops",
    color: "White",
    brand: "Uniqlo",
    tags: [],
    blobId: "",
    createdAt: BigInt(0),
    userId: "",
  },
  {
    id: "s2",
    name: "Navy Slim Trousers",
    category: "Bottoms",
    color: "Navy",
    brand: "Zara",
    tags: [],
    blobId: "",
    createdAt: BigInt(0),
    userId: "",
  },
  {
    id: "s3",
    name: "White Sneakers",
    category: "Shoes",
    color: "White",
    brand: "Adidas",
    tags: [],
    blobId: "",
    createdAt: BigInt(0),
    userId: "",
  },
  {
    id: "s4",
    name: "Camel Blazer",
    category: "Outerwear",
    color: "Camel",
    brand: "H&M",
    tags: [],
    blobId: "",
    createdAt: BigInt(0),
    userId: "",
  },
  {
    id: "s5",
    name: "Black Bag",
    category: "Accessories",
    color: "Black",
    brand: "Coach",
    tags: [],
    blobId: "",
    createdAt: BigInt(0),
    userId: "",
  },
  {
    id: "s6",
    name: "Olive Sweater",
    category: "Tops",
    color: "Olive",
    brand: "COS",
    tags: [],
    blobId: "",
    createdAt: BigInt(0),
    userId: "",
  },
];

const SAMPLE_SUGGESTIONS: OutfitSuggestion[] = [
  {
    name: "Smart Casual Office Look",
    itemIds: ["s1", "s2", "s3"],
    occasion: "Work",
  },
  {
    name: "Weekend Comfort Style",
    itemIds: ["s6", "s2", "s3"],
    occasion: "Casual",
  },
  {
    name: "Evening Chic Ensemble",
    itemIds: ["s1", "s2", "s4"],
    occasion: "Date Night",
  },
];

const CATEGORY_EMOJI: Record<string, string> = {
  Tops: "\u{1F455}",
  Bottoms: "\u{1F456}",
  Shoes: "\u{1F45F}",
  Accessories: "\u{1F45C}",
  Outerwear: "\u{1F9E5}",
};

function ItemChip({ item }: { item: ClothingItem | undefined }) {
  if (!item) return null;
  return (
    <div className="flex items-center gap-1.5 bg-secondary rounded-lg px-2 py-1 text-xs">
      <span>{CATEGORY_EMOJI[item.category] || "\u{1F457}"}</span>
      <span className="text-foreground font-medium truncate max-w-20">
        {item.name}
      </span>
    </div>
  );
}

function LoginPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <h2 className="font-display text-3xl font-bold text-foreground mb-3">
        AI Outfit Magic
      </h2>
      <p className="text-muted-foreground max-w-md mb-8 text-base">
        Sign in to get personalized AI outfit suggestions based on your
        wardrobe.
      </p>
      <Button
        size="lg"
        onClick={onLogin}
        className="bg-primary hover:bg-primary/90 text-white rounded-full px-10"
        data-ocid="outfits.login.button"
      >
        Sign In to Continue
      </Button>
    </div>
  );
}

export default function OutfitsPage() {
  const { login, identity } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: outfits = [], isLoading: outfitsLoading } = useOutfits();
  const { data: items = [] } = useClothingItems();
  const deleteOutfit = useDeleteOutfit();
  const addOutfit = useAddOutfit();
  const suggestOutfits = useSuggestOutfits();

  const [occasion, setOccasion] = useState("Casual");
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const allItems = isLoggedIn ? items : SAMPLE_ITEMS;
  const getItem = (id: string) => allItems.find((i) => i.id === id);

  const handleSuggest = async () => {
    if (!isLoggedIn) {
      setSuggestions(SAMPLE_SUGGESTIONS);
      setHasSearched(true);
      return;
    }
    try {
      const result = await suggestOutfits.mutateAsync(occasion);
      setSuggestions(result);
      setHasSearched(true);
      if (result.length === 0)
        toast.info("No suggestions found. Add more items to your wardrobe!");
    } catch {
      toast.error("Failed to get suggestions");
    }
  };

  const handleSaveOutfit = async (suggestion: OutfitSuggestion) => {
    if (!isLoggedIn) {
      toast.info("Sign in to save outfits");
      return;
    }
    try {
      await addOutfit.mutateAsync({
        name: suggestion.name,
        itemIds: suggestion.itemIds,
        occasion: suggestion.occasion,
      });
      toast.success("Outfit saved!");
    } catch {
      toast.error("Failed to save outfit");
    }
  };

  const handleDeleteOutfit = async (id: string) => {
    try {
      await deleteOutfit.mutateAsync(id);
      toast.success("Outfit removed");
    } catch {
      toast.error("Failed to delete outfit");
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-4xl font-bold text-foreground">
            Outfits
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Discover and save your perfect looks
          </p>
        </div>
      </div>

      {!isLoggedIn && <LoginPrompt onLogin={login} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* AI Suggest Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                AI Outfit Suggestions
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Cloud className="w-3.5 h-3.5" />
                <span>Sunny, 68°F · Perfect outfit weather</span>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-primary border-primary/30 bg-primary/5 self-start"
            >
              <Sparkles className="w-3 h-3 mr-1" /> AI Powered
            </Badge>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label
                  htmlFor="occasion-select"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Occasion
                </label>
                <Select value={occasion} onValueChange={setOccasion}>
                  <SelectTrigger
                    className="bg-background"
                    id="occasion-select"
                    data-ocid="outfits.occasion.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCASIONS.map((occ) => (
                      <SelectItem key={occ} value={occ}>
                        {occ}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSuggest}
                  disabled={suggestOutfits.isPending}
                  className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-6"
                  data-ocid="outfits.suggest.button"
                >
                  {suggestOutfits.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" /> Get Suggestions
                    </>
                  )}
                </Button>
              </div>
            </div>

            {!hasSearched && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Wand2 className="w-8 h-8 mx-auto mb-3 text-primary/40" />
                <p>Click “Get Suggestions” to see AI-powered outfit ideas</p>
              </div>
            )}

            {suggestOutfits.isPending && (
              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                data-ocid="outfits.suggest.loading_state"
              >
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i.toString()} className="h-48 rounded-xl" />
                ))}
              </div>
            )}

            {hasSearched &&
              !suggestOutfits.isPending &&
              suggestions.length === 0 && (
                <div
                  className="text-center py-8 text-muted-foreground text-sm"
                  data-ocid="outfits.suggest.empty_state"
                >
                  <ShirtIcon className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
                  <p>No suggestions found. Add more items to your wardrobe!</p>
                </div>
              )}

            {hasSearched &&
              !suggestOutfits.isPending &&
              suggestions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {suggestions.map((suggestion, idx) => (
                    <motion.div
                      key={suggestion.name}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="bg-background border border-border rounded-xl p-4"
                      data-ocid={`outfits.suggestion.item.${idx + 1}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-sm text-foreground leading-tight">
                          {suggestion.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ml-2 ${OCCASION_COLORS[suggestion.occasion] || "bg-gray-50 text-gray-700 border-gray-200"}`}
                        >
                          {suggestion.occasion}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {suggestion.itemIds.map((id) => (
                          <ItemChip key={id} item={getItem(id)} />
                        ))}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSaveOutfit(suggestion)}
                        disabled={addOutfit.isPending}
                        className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg h-8 text-xs"
                        data-ocid={`outfits.save_outfit.button.${idx + 1}`}
                      >
                        <Heart className="w-3 h-3 mr-1.5" /> Save Outfit
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
          </div>
        </section>

        {/* Saved Outfits */}
        <section>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Saved Outfits
          </h2>
          {outfitsLoading ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              data-ocid="outfits.list.loading_state"
            >
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i.toString()} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : outfits.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-2xl"
              data-ocid="outfits.list.empty_state"
            >
              <Heart className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-foreground mb-1">
                No saved outfits yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Use the AI suggestions above to create your first outfit
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {outfits.map((outfit, idx) => (
                <motion.div
                  key={outfit.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.07 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-card"
                  data-ocid={`outfits.item.${idx + 1}`}
                >
                  <div className="bg-secondary p-4">
                    <div className="grid grid-cols-3 gap-2">
                      {outfit.itemIds.slice(0, 3).map((id) => {
                        const item = getItem(id);
                        return (
                          <div
                            key={id}
                            className="aspect-square bg-background rounded-lg flex items-center justify-center text-2xl"
                          >
                            {CATEGORY_EMOJI[item?.category || ""] ||
                              "\u{1F457}"}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-display font-semibold text-base text-foreground leading-tight">
                        {outfit.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${OCCASION_COLORS[outfit.occasion] || "bg-gray-50 text-gray-700 border-gray-200"}`}
                      >
                        {outfit.occasion}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {outfit.itemIds.length} items
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteOutfit(outfit.id)}
                      disabled={deleteOutfit.isPending}
                      className="w-full h-8 text-xs text-destructive border-border hover:bg-destructive hover:text-white rounded-lg"
                      data-ocid={`outfits.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3 h-3 mr-1.5" /> Remove
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
