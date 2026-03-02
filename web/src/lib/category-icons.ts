import {
  ShoppingBag,
  Utensils,
  Home,
  Car,
  Zap,
  CircleDollarSign,
} from 'lucide-react'

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  food: Utensils,
  groceries: ShoppingBag,
  housing: Home,
  rent: Home,
  transport: Car,
  utilities: Zap,
}

export function getCategoryIcon(categoryName?: string): React.ElementType {
  if (!categoryName) return CircleDollarSign
  const key = categoryName.toLowerCase()
  for (const [k, icon] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(k)) return icon
  }
  return CircleDollarSign
}
