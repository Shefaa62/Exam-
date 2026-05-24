'use strict';

const FALLBACK_PRODUCTS = [
  {
    id: 'solestep-air-runner',
    title: 'Air Runner Pro',
    description: 'Lightweight everyday runners with breathable mesh, cushioned midsoles, and a grippy street-ready sole.',
    price: 129.99,
    discountedPrice: 89.99,
    rating: 4.7,
    tags: ['SoleStep', 'Running', 'Sneakers'],
    image: {
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80',
      alt: 'Red running shoe on a red background',
    },
    reviews: [
      { username: 'Ayesha', rating: 5, description: 'Comfortable from the first wear and great for long walks.' },
      { username: 'Hamza', rating: 4, description: 'Light, clean look, and the discount price is solid.' },
    ],
  },
  {
    id: 'solestep-trail-boot',
    title: 'Trail Guard Boot',
    description: 'Durable leather boots built for wet streets, weekend hikes, and cold-weather errands.',
    price: 159.99,
    discountedPrice: 139.99,
    rating: 4.5,
    tags: ['SoleStep', 'Outdoor', 'Boots'],
    image: {
      url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=900&q=80',
      alt: 'Brown leather boots',
    },
    reviews: [
      { username: 'Sara', rating: 5, description: 'Sturdy but still looks polished enough for city wear.' },
    ],
  },
  {
    id: 'solestep-formal-monk',
    title: 'Monk Strap Classic',
    description: 'Polished formal shoes with a rich leather finish and comfortable all-day support.',
    price: 149.99,
    discountedPrice: 149.99,
    rating: 4.8,
    tags: ['SoleStep', 'Formal', 'Leather'],
    image: {
      url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=900&q=80',
      alt: 'Brown formal leather shoes',
    },
    reviews: [
      { username: 'Bilal', rating: 5, description: 'Sharp finish and surprisingly comfortable for formal shoes.' },
    ],
  },
  {
    id: 'solestep-canvas-daily',
    title: 'Canvas Daily Low',
    description: 'Simple low-top casual shoes with soft lining and an easy pairing profile.',
    price: 74.99,
    discountedPrice: 59.99,
    rating: 4.3,
    tags: ['SoleStep', 'Casual', 'Sneakers'],
    image: {
      url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=900&q=80',
      alt: 'Casual canvas sneakers',
    },
    reviews: [],
  },
  {
    id: 'solestep-street-knit',
    title: 'Street Knit Flex',
    description: 'A flexible knit sneaker with a soft collar and responsive sole for daily movement.',
    price: 99.99,
    discountedPrice: 99.99,
    rating: 4.4,
    tags: ['SoleStep', 'Casual', 'Running'],
    image: {
      url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=900&q=80',
      alt: 'White athletic sneaker',
    },
    reviews: [],
  },
  {
    id: 'solestep-urban-boot',
    title: 'Urban Chelsea Boot',
    description: 'Clean Chelsea boots with elastic side panels, a stacked heel, and smooth leather texture.',
    price: 139.99,
    discountedPrice: 109.99,
    rating: 4.6,
    tags: ['SoleStep', 'Boots', 'Formal'],
    image: {
      url: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=900&q=80',
      alt: 'Black leather Chelsea boots',
    },
    reviews: [],
  },
  {
    id: 'solestep-court-white',
    title: 'Court White Sneaker',
    description: 'Minimal white court sneakers with a padded ankle, smooth upper, and clean everyday profile.',
    price: 94.99,
    discountedPrice: 79.99,
    rating: 4.6,
    tags: ['SoleStep', 'Casual', 'Sneakers'],
    image: {
      url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&q=80',
      alt: 'White casual sneakers',
    },
    reviews: [],
  },
  {
    id: 'solestep-hike-mid',
    title: 'Hike Mid Terrain',
    description: 'Mid-cut hiking shoes with reinforced toe protection and textured outsoles for uneven paths.',
    price: 134.99,
    discountedPrice: 119.99,
    rating: 4.5,
    tags: ['SoleStep', 'Outdoor', 'Hiking'],
    image: {
      url: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=900&q=80',
      alt: 'Outdoor hiking shoes',
    },
    reviews: [],
  },
];

function cloneFallbackProducts() {
  return FALLBACK_PRODUCTS.map(product => ({
    ...product,
    image: { ...product.image },
    reviews: product.reviews.map(review => ({ ...review })),
  }));
}

async function getAllProducts() {
  return cloneFallbackProducts();
}

async function getProductById(id) {
  const product = cloneFallbackProducts().find(item => item.id == id);
  if (product) return product;
  throw new Error('Could not load product. Please try again.');
}

window.API = {
  getAllProducts,
  getProductById,
};
