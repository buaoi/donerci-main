
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "completed" | "cancelled";
  date: string;
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load orders from localStorage
    try {
      const storedOrders = localStorage.getItem("orders");
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      } else {
        // Sample data if none exists
        const sampleOrders: Order[] = [
          {
            id: "1",
            userId: "2",
            userName: "John Doe",
            userEmail: "john@example.com",
            restaurantId: "1",
            restaurantName: "Istanbul Grill",
            items: [
              { id: "item1", name: "Adana Kebab", price: 15.99, quantity: 2 },
              { id: "item2", name: "Baklava", price: 7.99, quantity: 1 }
            ],
            total: 39.97,
            status: "completed",
            date: "2023-05-01 14:30:22"
          },
          {
            id: "2",
            userId: "3",
            userName: "Jane Smith",
            userEmail: "jane@example.com",
            restaurantId: "2",
            restaurantName: "Antalya Kebab",
            items: [
              { id: "item3", name: "Mixed Grill", price: 24.99, quantity: 1 },
              { id: "item4", name: "Turkish Tea", price: 3.50, quantity: 2 }
            ],
            total: 31.99,
            status: "pending",
            date: "2023-05-02 18:15:10"
          },
          {
            id: "3",
            userId: "2",
            userName: "John Doe",
            userEmail: "john@example.com",
            restaurantId: "3",
            restaurantName: "Bosphorus Delight",
            items: [
              { id: "item5", name: "Iskender Kebab", price: 18.50, quantity: 1 },
              { id: "item6", name: "Kunefe", price: 9.99, quantity: 1 }
            ],
            total: 28.49,
            status: "cancelled",
            date: "2023-05-03 20:45:30"
          }
        ];
        setOrders(sampleOrders);
        localStorage.setItem("orders", JSON.stringify(sampleOrders));
      }
    } catch (error) {
      console.error("Error loading order data:", error);
    }
  }, []);

  const updateOrderStatus = (orderId: string, newStatus: "pending" | "completed" | "cancelled") => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    
    toast({
      title: "Order updated",
      description: `Order #${orderId} status changed to ${newStatus}`
    });
    
    // Log activity
    logActivity("Update", "admin", `Updated order #${orderId} status to ${newStatus}`);
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

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.includes(searchTerm)
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Package size={20} />
          Order Management
        </h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-8 w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Table>
        <TableCaption>List of all customer orders</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Restaurant</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.id}</TableCell>
              <TableCell>
                <div>
                  <div>{order.userName}</div>
                  <div className="text-xs text-muted-foreground">{order.userEmail}</div>
                </div>
              </TableCell>
              <TableCell>{order.restaurantName}</TableCell>
              <TableCell>
                <div className="max-w-[200px]">
                  {order.items.map((item, index) => (
                    <div key={item.id} className="text-sm">
                      {item.quantity}x {item.name}
                      {index < order.items.length - 1 ? ", " : ""}
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>${order.total.toFixed(2)}</TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(order.status)}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateOrderStatus(order.id, "completed")}
                  disabled={order.status === "completed"}
                >
                  Complete
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateOrderStatus(order.id, "cancelled")}
                  disabled={order.status === "cancelled"}
                >
                  Cancel
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default OrderManagement;
