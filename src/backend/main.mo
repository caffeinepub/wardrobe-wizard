import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";

import AccessControl "authorization/access-control";
import Mixin "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";

actor {

  // ---- Types ----

  type ClothingItem = {
    id: Text;
    name: Text;
    category: Text;
    color: Text;
    brand: Text;
    tags: [Text];
    blobId: Text;
    createdAt: Int;
    userId: Text;
  };

  type Outfit = {
    id: Text;
    name: Text;
    itemIds: [Text];
    occasion: Text;
    createdAt: Int;
    userId: Text;
  };

  type WardrobeStats = {
    total: Nat;
    tops: Nat;
    bottoms: Nat;
    shoes: Nat;
    accessories: Nat;
    outerwear: Nat;
  };

  type OutfitSuggestion = {
    name: Text;
    itemIds: [Text];
    occasion: Text;
  };

  // ---- Storage ----

  var clothingStore : Map.Map<Text, ClothingItem> = Map.empty<Text, ClothingItem>();
  var outfitStore : Map.Map<Text, Outfit> = Map.empty<Text, Outfit>();
  var nextId : Nat = 0;
  let accessControlState : AccessControl.AccessControlState = AccessControl.initState();

  // ---- Mixin includes ----

  include Mixin();
  include MixinAuthorization(accessControlState);

  // ---- Helpers ----

  func genId() : Text {
    nextId := nextId + 1;
    Time.now().toText() # "-" # nextId.toText();
  };

  func mapVals<K, V>(store : Map.Map<K, V>) : [V] {
    store.entries().toArray().map(func((_, v)) { v });
  };

  func concatText(a : [Text], extra : Text) : [Text] {
    a.vals().concat([extra].vals()).toArray();
  };

  func concatSuggestion(a : [OutfitSuggestion], s : OutfitSuggestion) : [OutfitSuggestion] {
    a.vals().concat([s].vals()).toArray();
  };

  // ---- Clothing Items ----

  public shared(msg) func addClothingItem(
    name: Text,
    category: Text,
    color: Text,
    brand: Text,
    tags: [Text],
    blobId: Text
  ) : async ClothingItem {
    let id = genId();
    let item : ClothingItem = {
      id;
      name;
      category;
      color;
      brand;
      tags;
      blobId;
      createdAt = Time.now();
      userId = msg.caller.toText();
    };
    clothingStore.add(id, item);
    item;
  };

  public shared(msg) func getClothingItems() : async [ClothingItem] {
    let uid = msg.caller.toText();
    mapVals(clothingStore).filter(func(item : ClothingItem) : Bool { item.userId == uid });
  };

  public shared(msg) func updateClothingItem(
    id: Text,
    name: Text,
    category: Text,
    color: Text,
    brand: Text,
    tags: [Text],
    blobId: Text
  ) : async ?ClothingItem {
    let uid = msg.caller.toText();
    switch (clothingStore.get(id)) {
      case (?existing) {
        if (existing.userId != uid) return null;
        let updated : ClothingItem = {
          id;
          name;
          category;
          color;
          brand;
          tags;
          blobId;
          createdAt = existing.createdAt;
          userId = uid;
        };
        clothingStore.add(id, updated);
        ?updated;
      };
      case null null;
    };
  };

  public shared(msg) func deleteClothingItem(id: Text) : async Bool {
    let uid = msg.caller.toText();
    switch (clothingStore.get(id)) {
      case (?item) {
        if (item.userId != uid) return false;
        clothingStore.remove(id);
        true;
      };
      case null false;
    };
  };

  // ---- Outfits ----

  public shared(msg) func addOutfit(name: Text, itemIds: [Text], occasion: Text) : async Outfit {
    let id = genId();
    let outfit : Outfit = {
      id;
      name;
      itemIds;
      occasion;
      createdAt = Time.now();
      userId = msg.caller.toText();
    };
    outfitStore.add(id, outfit);
    outfit;
  };

  public shared(msg) func getOutfits() : async [Outfit] {
    let uid = msg.caller.toText();
    mapVals(outfitStore).filter(func(o : Outfit) : Bool { o.userId == uid });
  };

  public shared(msg) func deleteOutfit(id: Text) : async Bool {
    let uid = msg.caller.toText();
    switch (outfitStore.get(id)) {
      case (?outfit) {
        if (outfit.userId != uid) return false;
        outfitStore.remove(id);
        true;
      };
      case null false;
    };
  };

  // ---- Stats ----

  public shared(msg) func getWardrobeStats() : async WardrobeStats {
    let uid = msg.caller.toText();
    let items = mapVals(clothingStore).filter(func(i : ClothingItem) : Bool { i.userId == uid });
    var total = 0;
    var tops = 0;
    var bottoms = 0;
    var shoes = 0;
    var accessories = 0;
    var outerwear = 0;
    for (item in items.vals()) {
      total := total + 1;
      if (item.category == "tops") tops := tops + 1
      else if (item.category == "bottoms") bottoms := bottoms + 1
      else if (item.category == "shoes") shoes := shoes + 1
      else if (item.category == "accessories") accessories := accessories + 1
      else if (item.category == "outerwear") outerwear := outerwear + 1;
    };
    { total; tops; bottoms; shoes; accessories; outerwear };
  };

  // ---- AI Outfit Suggestions ----

  public shared(msg) func suggestOutfits(occasion: Text) : async [OutfitSuggestion] {
    let uid = msg.caller.toText();
    let items = mapVals(clothingStore).filter(func(i : ClothingItem) : Bool { i.userId == uid });

    let topsArr = items.filter(func(i : ClothingItem) : Bool { i.category == "tops" });
    let bottomsArr = items.filter(func(i : ClothingItem) : Bool { i.category == "bottoms" });
    let shoesArr = items.filter(func(i : ClothingItem) : Bool { i.category == "shoes" });
    let accessoriesArr = items.filter(func(i : ClothingItem) : Bool { i.category == "accessories" });

    let topCount = topsArr.size();
    let bottomCount = bottomsArr.size();
    let shoeCount = shoesArr.size();
    let accCount = accessoriesArr.size();

    var suggestions : [OutfitSuggestion] = [];

    if (topCount > 0 and bottomCount > 0) {
      var ids : [Text] = [topsArr[0].id, bottomsArr[0].id];
      if (shoeCount > 0) ids := concatText(ids, shoesArr[0].id);
      if (accCount > 0) ids := concatText(ids, accessoriesArr[0].id);
      suggestions := concatSuggestion(suggestions, { name = "Classic " # occasion # " Look"; itemIds = ids; occasion });
    };

    if (topCount > 1 and bottomCount > 0) {
      var ids : [Text] = [topsArr[1].id, bottomsArr[0].id];
      if (shoeCount > 1) ids := concatText(ids, shoesArr[1].id)
      else if (shoeCount > 0) ids := concatText(ids, shoesArr[0].id);
      suggestions := concatSuggestion(suggestions, { name = "Casual " # occasion # " Vibe"; itemIds = ids; occasion });
    };

    if (topCount > 0 and bottomCount > 1) {
      var ids : [Text] = [topsArr[0].id, bottomsArr[1].id];
      if (shoeCount > 0) ids := concatText(ids, shoesArr[0].id);
      if (accCount > 1) ids := concatText(ids, accessoriesArr[1].id)
      else if (accCount > 0) ids := concatText(ids, accessoriesArr[0].id);
      suggestions := concatSuggestion(suggestions, { name = "Fresh " # occasion # " Style"; itemIds = ids; occasion });
    };

    suggestions;
  };
};
