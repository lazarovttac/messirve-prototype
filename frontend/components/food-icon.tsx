import {
  Beef,
  Cake,
  Coffee,
  CookingPot,
  Cookie,
  Dessert,
  Fish,
  Grape,
  IceCreamCone,
  Pizza,
  Salad,
  Sandwich,
  Soup,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FoodIconProps = {
  foodType: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function FoodIcon({ foodType, size = "md", className }: FoodIconProps) {
  const foodTypeNormalized = foodType.toLowerCase();

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const iconSize = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  // Map food types to the correct CSS class names
  const getFoodIconClass = () => {
    switch (foodTypeNormalized) {
      case "bife":
        return "food-icon-steak";
      case "pasta":
        return "food-icon-pasta";
      case "salmón":
      case "salmon":
        return "food-icon-salmon";
      case "hamburguesa":
        return "food-icon-burger";
      case "risotto":
        return "food-icon-risotto";
      case "pizza":
        return "food-icon-pizza";
      case "postre":
      case "dessert":
        return "food-icon-dessert";
      case "helado":
      case "icecream":
        return "food-icon-icecream";
      case "pastel":
      case "cake":
        return "food-icon-cake";
      case "galleta":
      case "cookie":
        return "food-icon-cookie";
      case "vino":
      case "wine":
        return "food-icon-wine";
      case "pescado":
      case "fish":
        return "food-icon-fish";
      case "uva":
      case "grape":
        return "food-icon-grape";
      default:
        return "food-icon-pasta"; // Default style
    }
  };

  const getIcon = () => {
    switch (foodTypeNormalized) {
      case "bife":
        return <Beef size={iconSize[size]} className="text-white" />;
      case "pasta":
        return <UtensilsCrossed size={iconSize[size]} className="text-white" />;
      case "ensalada":
      case "salad":
        return <Salad size={iconSize[size]} className="text-white" />;
      case "hamburguesa":
        return <Sandwich size={iconSize[size]} className="text-white" />;
      case "risotto":
        return <Soup size={iconSize[size]} className="text-white" />;
      case "pizza":
        return <Pizza size={iconSize[size]} className="text-white" />;
      case "postre":
      case "dessert":
        return <Dessert size={iconSize[size]} className="text-white" />;
      case "helado":
      case "icecream":
        return <IceCreamCone size={iconSize[size]} className="text-white" />;
      case "pastel":
      case "cake":
        return <Cake size={iconSize[size]} className="text-white" />;
      case "galleta":
      case "cookie":
        return <Cookie size={iconSize[size]} className="text-white" />;
      case "vino":
      case "wine":
        return <Wine size={iconSize[size]} className="text-white" />;
      case "pescado":
      case "salmón":
      case "salmon":
      case "fish":
        return <Fish size={iconSize[size]} className="text-white" />;
      case "uva":
      case "grape":
        return <Grape size={iconSize[size]} className="text-white" />;
      default:
        return <CookingPot size={iconSize[size]} className="text-white" />;
    }
  };

  return (
    <div
      className={cn(
        "food-icon",
        getFoodIconClass(),
        sizeClasses[size],
        className
      )}
    >
      {getIcon()}
    </div>
  );
}
