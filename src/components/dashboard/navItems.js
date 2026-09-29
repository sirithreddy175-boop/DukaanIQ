import {
  LayoutDashboard,
  ShoppingCart,
  Tag,
  Package,
  Sparkles,
  Brain,
  Settings as SettingsIcon,
  Home,
  Mic,
  Plus,
  LayoutGrid,
} from "lucide-react";

// Primary navigation for the dashboard (desktop sidebar + mobile).
export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", to: "/app", icon: LayoutDashboard, end: true },
  { key: "purchases", label: "Purchases", to: "/app/purchases", icon: ShoppingCart },
  { key: "sales", label: "Sales", to: "/app/sales", icon: Tag },
  { key: "products", label: "Products", to: "/app/products", icon: Package },
  { key: "insights", label: "Insights", to: "/app/insights", icon: Sparkles },
  { key: "memories", label: "Memories", to: "/app/memories", icon: Brain },
  { key: "settings", label: "Settings", to: "/app/settings", icon: SettingsIcon },
];

// Mobile bottom-nav priority items (Home, Ask, Add, Insights, More).
export const MOBILE_NAV = [
  { key: "home", label: "Home", to: "/app", icon: Home, end: true },
  { key: "ask", label: "Ask", action: "ask", icon: Mic },
  { key: "add", label: "Add", action: "add", icon: Plus, center: true },
  { key: "insights", label: "Insights", to: "/app/insights", icon: Sparkles },
  { key: "more", label: "More", action: "more", icon: LayoutGrid },
];