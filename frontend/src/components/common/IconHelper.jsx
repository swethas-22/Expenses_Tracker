import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Car,
  Home,
  Heart,
  Gamepad2,
  ShoppingBag,
  MoreHorizontal,
  Wallet,
  Laptop,
  TrendingUp,
  CircleDollarSign,
  Tag,
  Key,
  Coffee,
  Plane,
  Gift,
  Film
} from 'lucide-react';

const ICON_MAP = {
  'utensils': Utensils,
  'food': Utensils,
  'dining': Utensils,
  'shopping-cart': ShoppingCart,
  'groceries': ShoppingCart,
  'car': Car,
  'transport': Car,
  'home': Home,
  'bills': Home,
  'key': Key,
  'rent': Key,
  'heart': Heart,
  'health': Heart,
  'gamepad-2': Gamepad2,
  'entertainment': Gamepad2,
  'shopping-bag': ShoppingBag,
  'shopping': ShoppingBag,
  'more-horizontal': MoreHorizontal,
  'others': MoreHorizontal,
  'wallet': Wallet,
  'salary': Wallet,
  'laptop': Laptop,
  'freelance': Laptop,
  'trending-up': TrendingUp,
  'investments': TrendingUp,
  'circle-dollar-sign': CircleDollarSign,
  'tag': Tag,
  'coffee': Coffee,
  'plane': Plane,
  'gift': Gift,
  'film': Film
};

export function getCategoryIcon(iconKey) {
  const normalized = (iconKey || 'tag').toLowerCase();
  return ICON_MAP[normalized] || Tag;
}

export function CategoryIconBadge({ icon, color = '#A78BFA', size = 18, className = '' }) {
  const IconComponent = getCategoryIcon(icon);

  return (
    <div
      className={`flex items-center justify-center rounded-2xl transition-transform duration-200 ${className}`}
      style={{
        backgroundColor: `${color}25`,
        color: color
      }}
    >
      <IconComponent size={size} strokeWidth={2.2} />
    </div>
  );
}
