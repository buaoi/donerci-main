
import { useState } from 'react';
import { Navbar, Footer } from '@/components';
import { ShoppingCart, Minus, Plus, X, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const CartPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: ''
  });
  
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    totalItems,
    subtotal,
    clearCart 
  } = useCart();
  
  const deliveryFee = 2.99;
  const total = subtotal + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      setCheckoutOpen(true);
    } else {
      toast({
        title: "Cart Empty",
        description: "Please add items to your cart before checking out."
      });
    }
  };

  const processOrder = () => {
    // Validate form
    if (!formData.name || !formData.email || !formData.address || !formData.phone) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setOrderProcessing(true);

    // Get restaurant info from first item (assuming all items are from same restaurant)
    const restaurantId = cartItems[0]?.restaurantId || "unknown";
    const restaurantName = cartItems[0]?.restaurantName || "Unknown Restaurant";

    // Create order object
    const order = {
      id: Date.now().toString(),
      userId: "guest-" + Math.floor(Math.random() * 1000),
      userName: formData.name,
      userEmail: formData.email,
      userAddress: formData.address,
      userPhone: formData.phone,
      restaurantId: restaurantId,
      restaurantName: restaurantName,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total: total,
      status: "pending",
      date: new Date().toLocaleString()
    };

    // Save to localStorage
    try {
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = [order, ...existingOrders];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));

      // Log activity
      const newActivity = {
        id: Date.now().toString(),
        type: "Order",
        user: formData.email,
        details: `New order #${order.id} placed for ${restaurantName}`,
        timestamp: new Date().toLocaleString()
      };
      
      const storedActivities = localStorage.getItem("activities");
      let activities = storedActivities ? JSON.parse(storedActivities) : [];
      activities = [newActivity, ...activities];
      localStorage.setItem("activities", JSON.stringify(activities));

      // Clear cart and close dialog
      setTimeout(() => {
        clearCart();
        setOrderProcessing(false);
        setCheckoutOpen(false);
        
        // Show success message and redirect
        toast({
          title: "Order placed successfully!",
          description: "Your order has been received and is being processed."
        });
        
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error("Error processing order:", error);
      setOrderProcessing(false);
      toast({
        title: "Error",
        description: "There was a problem processing your order. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <ShoppingCart className="mr-2 h-6 w-6" />
          Your Cart ({totalItems} items)
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Button asChild>
              <Link to="/restaurants">Browse Restaurants</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Cart Items</h2>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center pb-4 border-b border-border">
                        <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{item.name}</h3>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => removeFromCart(item.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-border rounded-md">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <span className="font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-6 bg-accent hover:bg-accent/90"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full mt-3" asChild>
                    <Link to="/restaurants">Continue Shopping</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                value={formData.email} 
                onChange={handleInputChange}
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="address">Delivery Address</Label>
              <Input 
                id="address" 
                name="address" 
                value={formData.address} 
                onChange={handleInputChange}
                placeholder="123 Main St, City, State, ZIP"
                required
              />
            </div>

            <div className="border-t pt-4 mt-2">
              <div className="flex justify-between font-medium">
                <span>Total Amount:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCheckoutOpen(false)}
              disabled={orderProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={processOrder} 
              className="bg-accent hover:bg-accent/90"
              disabled={orderProcessing}
            >
              {orderProcessing ? (
                <span className="flex items-center">
                  Processing
                  <span className="ml-2 animate-spin">•</span>
                </span>
              ) : (
                <span className="flex items-center">
                  Place Order
                  <Check className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CartPage;
