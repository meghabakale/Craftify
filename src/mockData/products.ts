import { Product } from '../types';
import { MOCK_PRODUCTS } from '../data/mockData';
import { PRODUCT_IMAGES } from './imageAssets';

export const products: Product[] = MOCK_PRODUCTS.map((p) => {
  const explicitImage = PRODUCT_IMAGES[p.id] || p.imageUrl;
  return {
    ...p,
    imageUrl: explicitImage,
  };
});

export default products;
