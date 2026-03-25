# Wardrobe Wizard

## Current State
New project with empty Motoko backend and default React frontend.

## Requested Changes (Diff)

### Add
- User authentication (login/signup)
- Clothing item management: add, view, edit, delete items with photo upload
- Item attributes: name, category (tops, bottoms, shoes, accessories, outerwear), color, brand, tags
- Visual wardrobe grid view with item photos
- Category filter/navigation
- AI-powered outfit suggestion system that combines items into complete looks
- Outfit saving and management
- Dashboard with wardrobe stats (total items, by category)
- Sample/seed clothing data for demonstration

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: clothing item CRUD, outfit storage, AI suggestion logic (rule-based combinations by color/category), user-scoped data
2. Frontend: wardrobe grid with photo thumbnails, category sidebar, item add/edit forms with camera/upload, outfit suggestion panel
3. Components: authorization (user accounts), blob-storage (clothing photos), camera (photo capture)
