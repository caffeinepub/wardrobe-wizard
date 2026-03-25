import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export interface ClothingItem {
    id: string;
    name: string;
    category: string;
    color: string;
    brand: string;
    tags: string[];
    blobId: string;
    createdAt: bigint;
    userId: string;
}

export interface Outfit {
    id: string;
    name: string;
    itemIds: string[];
    occasion: string;
    createdAt: bigint;
    userId: string;
}

export interface WardrobeStats {
    total: bigint;
    tops: bigint;
    bottoms: bigint;
    shoes: bigint;
    accessories: bigint;
    outerwear: bigint;
}

export interface OutfitSuggestion {
    name: string;
    itemIds: string[];
    occasion: string;
}

export interface backendInterface {
    addClothingItem(name: string, category: string, color: string, brand: string, tags: string[], blobId: string): Promise<ClothingItem>;
    getClothingItems(): Promise<ClothingItem[]>;
    updateClothingItem(id: string, name: string, category: string, color: string, brand: string, tags: string[], blobId: string): Promise<Option<ClothingItem>>;
    deleteClothingItem(id: string): Promise<boolean>;
    addOutfit(name: string, itemIds: string[], occasion: string): Promise<Outfit>;
    getOutfits(): Promise<Outfit[]>;
    deleteOutfit(id: string): Promise<boolean>;
    getWardrobeStats(): Promise<WardrobeStats>;
    suggestOutfits(occasion: string): Promise<OutfitSuggestion[]>;
}
