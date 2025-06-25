import {
  Beef,
  Coffee,
  Pizza,
  Salad,
  Sandwich,
  UtensilsCrossed,
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
      case "salmón":
      case "salmon":
        return <Salad size={iconSize[size]} className="text-white" />;
      case "hamburguesa":
        return <Sandwich size={iconSize[size]} className="text-white" />;
      case "risotto":
        return <Coffee size={iconSize[size]} className="text-white" />;
      case "pizza":
        return <Pizza size={iconSize[size]} className="text-white" />;
      default:
        return <UtensilsCrossed size={iconSize[size]} className="text-white" />;
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
