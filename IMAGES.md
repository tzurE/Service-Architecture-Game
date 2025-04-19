# Adding Component Images to the Service Game

This guide explains how to add your own component images to the service game.

## Option 1: Using Your Own Images

1. Create an `images` directory in the project root (if it doesn't exist already).
2. Add your component images to this directory with the following filenames:
   - `server.png` - Image for the Server component
   - `database.png` - Image for the Database component
   - `cache.png` - Image for the Cache component
   - `api_gateway.png` - Image for the API Gateway component
   - `load_balancer.png` - Image for the Load Balancer component
   - `users.png` - Image for the Users component
3. Run the following command to copy your images to the correct location:
   ```
   npm run add-images
   ```

## Option 2: Generating Placeholder Images

If you don't have your own images yet, you can generate placeholder images:

1. Install the required dependencies:
   ```
   npm install
   ```

2. Run the following command to generate placeholder images:
   ```
   npm run generate-images
   ```

## Image Requirements

- Format: PNG
- Size: 96x48 pixels (or similar aspect ratio)
- Background: Transparent (recommended)
- Style: Isometric or top-down view of the component

## Troubleshooting

If you encounter any issues with the images:

1. Make sure the filenames match the component types (e.g., `server.png` for the Server component).
2. Check that the images are in PNG format.
3. Try regenerating the placeholder images using the `npm run generate-images` command.
4. If the images still don't appear, check the browser console for any errors. 