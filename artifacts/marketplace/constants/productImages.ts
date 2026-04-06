// Maps product IDs to their local image assets.
// React Native requires static require() calls for bundled images.
const productImageMap: Record<string, number> = {
  p1: require("../assets/images/products/camera.png"),
  p2: require("../assets/images/products/leather_jacket.png"),
  p3: require("../assets/images/products/macbook.png"),
  p4: require("../assets/images/products/bicycle.png"),
  p5: require("../assets/images/products/kallax_shelf.png"),
  p6: require("../assets/images/products/dyson_vacuum.png"),
};

export default productImageMap;
