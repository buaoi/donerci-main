
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface FoodCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId?: string;
  restaurantName?: string;
  onAddToCart?: (id: string) => void;
  isAIRecommended?: boolean;
}

const FoodCard = ({
  id,
  name,
  description,
  price,
  image,
  restaurantId,
  restaurantName,
  onAddToCart,
  isAIRecommended = false,
}: FoodCardProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Add to context cart
    addToCart({
      id,
      name,
      price,
      image
    });
    
    // Call the onAddToCart prop if provided (for backward compatibility)
    if (onAddToCart) {
      onAddToCart(id);
    }

    // Record the order in localStorage if restaurant info is available
    if (restaurantId && restaurantName) {
      try {
        // Get current user
        const currentUser = localStorage.getItem("currentUser");
        if (currentUser) {
          const userData = JSON.parse(currentUser);
          
          // Get existing orders or create empty array
          const storedOrders = localStorage.getItem("orders");
          const orders = storedOrders ? JSON.parse(storedOrders) : [];
          
          // Check if there's a pending order for this user and restaurant
          const existingPendingOrderIndex = orders.findIndex(
            (order: any) => 
              order.userId === userData.id && 
              order.restaurantId === restaurantId && 
              order.status === "pending"
          );
          
          if (existingPendingOrderIndex >= 0) {
            // Add to existing order
            const existingOrder = orders[existingPendingOrderIndex];
            const existingItemIndex = existingOrder.items.findIndex(
              (item: any) => item.id === id
            );
            
            if (existingItemIndex >= 0) {
              // Increment quantity
              existingOrder.items[existingItemIndex].quantity += 1;
            } else {
              // Add new item
              existingOrder.items.push({
                id,
                name,
                price,
                quantity: 1
              });
            }
            
            // Recalculate total
            existingOrder.total = existingOrder.items.reduce(
              (sum: number, item: any) => sum + (item.price * item.quantity), 0
            );
            
            orders[existingPendingOrderIndex] = existingOrder;
          } else {
            // Create new order
            const newOrder = {
              id: Date.now().toString(),
              userId: userData.id,
              userName: userData.name,
              userEmail: userData.email,
              restaurantId,
              restaurantName,
              items: [{
                id,
                name,
                price,
                quantity: 1
              }],
              total: price,
              status: "pending",
              date: new Date().toLocaleString()
            };
            
            orders.unshift(newOrder);
          }
          
          // Save updated orders
          localStorage.setItem("orders", JSON.stringify(orders));
          
          // Log activity
          logActivity("Order", userData.email, `Added ${name} to cart from ${restaurantName}`);
        }
      } catch (error) {
        console.error("Error recording order:", error);
      }
    }

    // Show toast notification
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart.`,
      duration: 2000,
    });
  };
  
  const logActivity = (type: string, user: string, details: string) => {
    try {
      const storedActivities = localStorage.getItem("activities");
      let activities = storedActivities ? JSON.parse(storedActivities) : [];
      
      const newActivity = {
        id: Date.now().toString(),
        type,
        user,
        details,
        timestamp: new Date().toLocaleString()
      };
      
      activities = [newActivity, ...activities];
      localStorage.setItem("activities", JSON.stringify(activities));
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-border transition-all duration-300 hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden">
          <div className={cn("absolute inset-0 bg-gray-200", !isImageLoaded && "animate-pulse")} />
          <img
            src={image}
            alt={name}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500 ease-out",
              isHovered && "scale-105",
              isImageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setIsImageLoaded(true)}
          />
          {isAIRecommended && (
            <div className="absolute top-3 right-3 z-10 bg-accent text-white text-xs px-2 py-0.5 rounded-full">
              AI Recommended
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-base">{name}</h3>
            <span className="font-medium text-base">${price.toFixed(2)}</span>
          </div>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{description}</p>
          <Button
            onClick={handleAddToCart}
            className="mt-3 w-full bg-accent text-white hover:bg-accent/90 transition-all"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" /> Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
