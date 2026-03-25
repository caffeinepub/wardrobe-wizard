import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ClothingItem,
  Outfit,
  OutfitSuggestion,
  WardrobeStats,
} from "../backend.d";
import { useActor } from "./useActor";

export function useClothingItems() {
  const { actor, isFetching } = useActor();
  return useQuery<ClothingItem[]>({
    queryKey: ["clothingItems"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getClothingItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWardrobeStats() {
  const { actor, isFetching } = useActor();
  return useQuery<WardrobeStats>({
    queryKey: ["wardrobeStats"],
    queryFn: async () => {
      if (!actor)
        return {
          total: 0n,
          tops: 0n,
          bottoms: 0n,
          shoes: 0n,
          accessories: 0n,
          outerwear: 0n,
        };
      return (actor as any).getWardrobeStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOutfits() {
  const { actor, isFetching } = useActor();
  return useQuery<Outfit[]>({
    queryKey: ["outfits"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getOutfits();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddClothingItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      category: string;
      color: string;
      brand: string;
      tags: string[];
      blobId: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).addClothingItem(
        params.name,
        params.category,
        params.color,
        params.brand,
        params.tags,
        params.blobId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clothingItems"] });
      queryClient.invalidateQueries({ queryKey: ["wardrobeStats"] });
    },
  });
}

export function useUpdateClothingItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      category: string;
      color: string;
      brand: string;
      tags: string[];
      blobId: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).updateClothingItem(
        params.id,
        params.name,
        params.category,
        params.color,
        params.brand,
        params.tags,
        params.blobId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clothingItems"] });
    },
  });
}

export function useDeleteClothingItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).deleteClothingItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clothingItems"] });
      queryClient.invalidateQueries({ queryKey: ["wardrobeStats"] });
    },
  });
}

export function useAddOutfit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      itemIds: string[];
      occasion: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).addOutfit(
        params.name,
        params.itemIds,
        params.occasion,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
    },
  });
}

export function useDeleteOutfit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).deleteOutfit(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
    },
  });
}

export function useSuggestOutfits() {
  const { actor } = useActor();
  return useMutation<OutfitSuggestion[], Error, string>({
    mutationFn: async (occasion: string) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).suggestOutfits(occasion);
    },
  });
}
