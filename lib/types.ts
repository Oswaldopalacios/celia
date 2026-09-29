export type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  userType?: "admin" | "operator";
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type ProductType = "comida" | "bebidas";

export type ProductCategory = {
  _id: string;
  title: string;
  kind?: ProductType;
  icon?: string;
  productCount?: number;
};

export type ProductPortion = {
  _id: string;
  name: string;
  price: number;
};

export type Product = {
  _id: string;
  name: string;
  description?: string;
  /** Single price, or the cheapest portion when the product has portions. */
  price: number;
  quantity?: string;
  portions?: ProductPortion[];
  productType?: ProductType;
  isSoldOut?: boolean;
  isFeatured?: boolean;
  image?: string;
  category?: ProductCategory;
  createdAt?: string;
};

export type ProductPortionInput = {
  _id?: string;
  name: string;
  price: string;
};

export type ProductsResponse = {
  message: string;
  products: Product[];
};

export type CategoriesResponse = {
  message: string;
  categories: ProductCategory[];
};

export type ProductPayload = {
  name: string;
  description?: string;
  price: string;
  quantity?: string;
  productType: ProductType;
  category: string;
  isSoldOut?: boolean;
  isFeatured?: boolean;
  image: File | null;
  /** Omit to leave the saved portions untouched; [] removes them. */
  portions?: ProductPortionInput[];
};

export type CatalogStats = {
  generatedAt: string;
  catalog: {
    products: number;
    categories: number;
    soldOut: number;
    comida: number;
    bebidas: number;
  };
  recentProducts: Product[];
};

export type CatalogStatsResponse = {
  message: string;
  stats: CatalogStats;
};

export type LocationHour = {
  label: string;
  value: string;
};

export type LocationReferenceIcon =
  | "palm"
  | "pin"
  | "car"
  | "waves"
  | "sun"
  | "fork"
  | "house"
  | "star";

export type LocationReference = {
  label: string;
  icon: LocationReferenceIcon;
};

export type ContactSettings = {
  phone: string;
  whatsapp: string;
  email: string;
  name: string;
  place: string;
  address: string;
  mapsQuery: string;
  description: string;
  hours: LocationHour[];
  references: LocationReference[];
  updatedAt?: string;
};

export type ContactSettingsInput = Omit<ContactSettings, "updatedAt">;

export type ContactSettingsResponse = {
  message: string;
  contact: ContactSettings;
};

export type GalleryCategory = {
  _id: string;
  title: string;
  imageCount?: number;
};

export type GalleryImage = {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  image: string;
  isFeatured?: boolean;
  category?: GalleryCategory;
  createdAt?: string;
};

export type GalleryCategoriesResponse = {
  message: string;
  categories: GalleryCategory[];
};

export type GalleryImagesResponse = {
  message: string;
  images: GalleryImage[];
};

export type GalleryImagePayload = {
  title: string;
  description?: string;
  location?: string;
  category: string;
  isFeatured?: boolean;
  image: File | null;
};
