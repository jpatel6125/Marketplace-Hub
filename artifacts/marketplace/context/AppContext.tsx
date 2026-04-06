import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  rating: number;
  reviewCount: number;
  joinedAt: string;
  totalSales: number;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerAvatar?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  location: string;
  condition: "New" | "Like New" | "Good" | "Fair" | "Poor";
  status: "active" | "sold" | "pending";
  createdAt: string;
  views: number;
  isFavorited?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  productPrice: number;
  buyerId: string;
  sellerId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  messages: Message[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  productPrice: number;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  isBuyer: boolean;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  targetUserId: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface AppContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  products: Product[];
  chatRooms: ChatRoom[];
  orders: Order[];
  reviews: Review[];
  favorites: string[];
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "createdAt" | "views" | "sellerId" | "sellerName" | "sellerRating">) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleFavorite: (productId: string) => void;
  sendMessage: (chatRoomId: string, text: string) => void;
  startChat: (product: Product) => string;
  placeOrder: (product: Product) => Order;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  addReview: (review: Omit<Review, "id" | "createdAt">) => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    sellerId: "u2",
    sellerName: "Alex Chen",
    sellerRating: 4.8,
    title: "Canon EOS M50 Mark II Camera",
    description: "Excellent mirrorless camera, used for 6 months. Comes with 15-45mm kit lens, original box, charger, and strap. Perfect for content creators and photographers.",
    price: 480,
    category: "Electronics",
    images: [],
    location: "San Francisco, CA",
    condition: "Like New",
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    views: 47,
  },
  {
    id: "p2",
    sellerId: "u3",
    sellerName: "Maria Garcia",
    sellerRating: 4.5,
    title: "Vintage Leather Jacket - Size M",
    description: "Gorgeous brown leather jacket from the 80s. Real leather, excellent vintage condition. A few minor scuffs consistent with age. Size medium.",
    price: 145,
    category: "Clothing",
    images: [],
    location: "Brooklyn, NY",
    condition: "Good",
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    views: 89,
  },
  {
    id: "p3",
    sellerId: "u4",
    sellerName: "Jordan Lee",
    sellerRating: 5.0,
    title: "MacBook Pro 14\" M2 (2023)",
    description: "Selling my MacBook Pro M2. 16GB RAM, 512GB SSD. Used for 8 months, in perfect condition. Space Gray. Original accessories included.",
    price: 1650,
    category: "Electronics",
    images: [],
    location: "Austin, TX",
    condition: "Like New",
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    views: 134,
  },
  {
    id: "p4",
    sellerId: "u5",
    sellerName: "Sam Park",
    sellerRating: 4.2,
    title: "Trek FX 3 Hybrid Bike",
    description: "Great all-around commuter bike. Size M/L. Recently tuned up with new brake pads and tires. Perfect for city riding. Minor scratches on frame.",
    price: 380,
    category: "Sports",
    images: [],
    location: "Seattle, WA",
    condition: "Good",
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    views: 62,
  },
  {
    id: "p5",
    sellerId: "u2",
    sellerName: "Alex Chen",
    sellerRating: 4.8,
    title: "IKEA KALLAX 4x4 Shelf Unit",
    description: "White KALLAX 4x4 bookcase. Good condition, minor wear on edges. Disassembled for easy transport. Dimensions: 147x147cm.",
    price: 85,
    category: "Furniture",
    images: [],
    location: "San Francisco, CA",
    condition: "Good",
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    views: 28,
  },
  {
    id: "p6",
    sellerId: "u6",
    sellerName: "Emma Wilson",
    sellerRating: 4.9,
    title: "Dyson V11 Cordless Vacuum",
    description: "Dyson V11 Torque Drive. Barely used, purchased 4 months ago. All attachments included. Works perfectly, selling because we got a robot vacuum.",
    price: 320,
    category: "Home & Garden",
    images: [],
    location: "Chicago, IL",
    condition: "Like New",
    status: "active",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    views: 91,
  },
];

const MOCK_CHAT_ROOMS: ChatRoom[] = [
  {
    id: "c1",
    productId: "p1",
    productTitle: "Canon EOS M50 Mark II Camera",
    productPrice: 480,
    buyerId: "u1",
    sellerId: "u2",
    otherUserId: "u2",
    otherUserName: "Alex Chen",
    messages: [
      { id: "m1", senderId: "u2", text: "Hi! The camera is still available.", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), read: true },
      { id: "m2", senderId: "u1", text: "Great! Can we negotiate on the price a little?", timestamp: new Date(Date.now() - 3600000).toISOString(), read: true },
      { id: "m3", senderId: "u2", text: "Best I can do is $450. It's in perfect condition.", timestamp: new Date(Date.now() - 1800000).toISOString(), read: false },
    ],
    lastMessage: "Best I can do is $450. It's in perfect condition.",
    lastMessageTime: new Date(Date.now() - 1800000).toISOString(),
    unreadCount: 1,
  },
];

const MOCK_ORDERS: Order[] = [
  {
    id: "o1",
    productId: "p3",
    productTitle: "MacBook Pro 14\" M2 (2023)",
    productPrice: 1650,
    buyerId: "u1",
    buyerName: "You",
    sellerId: "u4",
    sellerName: "Jordan Lee",
    status: "shipped",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    isBuyer: true,
  },
];

const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    reviewerId: "u3",
    reviewerName: "Maria Garcia",
    orderId: "o0",
    targetUserId: "u1",
    rating: 5,
    comment: "Smooth transaction! Item was exactly as described. Would buy again.",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: "r2",
    reviewerId: "u4",
    reviewerName: "Jordan Lee",
    orderId: "o0b",
    targetUserId: "u1",
    rating: 4,
    comment: "Good seller, quick responses. Item was in great condition.",
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(MOCK_CHAT_ROOMS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const userJson = await AsyncStorage.getItem("currentUser");
      const favJson = await AsyncStorage.getItem("favorites");
      const productsJson = await AsyncStorage.getItem("products");
      const chatJson = await AsyncStorage.getItem("chatRooms");
      const ordersJson = await AsyncStorage.getItem("orders");
      const reviewsJson = await AsyncStorage.getItem("reviews");
      if (userJson) {
        setCurrentUser(JSON.parse(userJson));
        setIsLoggedIn(true);
      }
      if (favJson) setFavorites(JSON.parse(favJson));
      if (productsJson) setProducts(JSON.parse(productsJson));
      if (chatJson) setChatRooms(JSON.parse(chatJson));
      if (ordersJson) setOrders(JSON.parse(ordersJson));
      if (reviewsJson) setReviews(JSON.parse(reviewsJson));
    } catch {}
  };

  const save = async (key: string, value: unknown) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {}
  };

  const login = useCallback(async (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    await save("currentUser", user);
  }, []);

  const logout = useCallback(async () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    await AsyncStorage.removeItem("currentUser");
  }, []);

  const addProduct = useCallback(
    (product: Omit<Product, "id" | "createdAt" | "views" | "sellerId" | "sellerName" | "sellerRating">) => {
      if (!currentUser) return;
      const newProduct: Product = {
        ...product,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        sellerRating: currentUser.rating,
        sellerAvatar: currentUser.avatar,
        createdAt: new Date().toISOString(),
        views: 0,
        status: "active",
      };
      const updated = [newProduct, ...products];
      setProducts(updated);
      save("products", updated);
    },
    [currentUser, products]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
      setProducts(updated);
      save("products", updated);
    },
    [products]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      save("products", updated);
    },
    [products]
  );

  const toggleFavorite = useCallback(
    (productId: string) => {
      const updated = favorites.includes(productId)
        ? favorites.filter((id) => id !== productId)
        : [...favorites, productId];
      setFavorites(updated);
      save("favorites", updated);
    },
    [favorites]
  );

  const startChat = useCallback(
    (product: Product): string => {
      if (!currentUser) return "";
      const existingRoom = chatRooms.find(
        (r) => r.productId === product.id && r.buyerId === currentUser.id
      );
      if (existingRoom) return existingRoom.id;
      const newRoom: ChatRoom = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        productId: product.id,
        productTitle: product.title,
        productImage: product.images[0],
        productPrice: product.price,
        buyerId: currentUser.id,
        sellerId: product.sellerId,
        otherUserId: product.sellerId,
        otherUserName: product.sellerName,
        otherUserAvatar: product.sellerAvatar,
        messages: [],
        unreadCount: 0,
      };
      const updated = [newRoom, ...chatRooms];
      setChatRooms(updated);
      save("chatRooms", updated);
      return newRoom.id;
    },
    [currentUser, chatRooms]
  );

  const sendMessage = useCallback(
    (chatRoomId: string, text: string) => {
      if (!currentUser) return;
      const msg: Message = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        senderId: currentUser.id,
        text,
        timestamp: new Date().toISOString(),
        read: false,
      };
      const updated = chatRooms.map((room) => {
        if (room.id !== chatRoomId) return room;
        return {
          ...room,
          messages: [...room.messages, msg],
          lastMessage: text,
          lastMessageTime: msg.timestamp,
        };
      });
      setChatRooms(updated);
      save("chatRooms", updated);
    },
    [currentUser, chatRooms]
  );

  const placeOrder = useCallback(
    (product: Product): Order => {
      if (!currentUser) throw new Error("Not logged in");
      const newOrder: Order = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        productId: product.id,
        productTitle: product.title,
        productImage: product.images[0],
        productPrice: product.price,
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isBuyer: true,
      };
      const updated = [newOrder, ...orders];
      setOrders(updated);
      save("orders", updated);
      updateProduct(product.id, { status: "pending" });
      return newOrder;
    },
    [currentUser, orders, updateProduct]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: Order["status"]) => {
      const updated = orders.map((o) =>
        o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
      );
      setOrders(updated);
      save("orders", updated);
    },
    [orders]
  );

  const addReview = useCallback(
    (review: Omit<Review, "id" | "createdAt">) => {
      const newReview: Review = {
        ...review,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      const updated = [newReview, ...reviews];
      setReviews(updated);
      save("reviews", updated);
    },
    [reviews]
  );

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!currentUser) return;
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      await save("currentUser", updated);
    },
    [currentUser]
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        products,
        chatRooms,
        orders,
        reviews,
        favorites,
        login,
        logout,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleFavorite,
        sendMessage,
        startChat,
        placeOrder,
        updateOrderStatus,
        addReview,
        updateProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
