export type OrderStatus = 'delivered' | 'pending' | 'processing' | 'cancelled';
export type ProductStatus = 'active' | 'draft' | 'archived';
export type CustomerStatus = 'active' | 'inactive' | 'blocked';
export type NotificationType = 'order_placed' | 'low_stock' | 'new_customer' | 'system';

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          avatar_initials: string;
          avatar_color: string;
          status: CustomerStatus;
          lifetime_value: number;
          total_orders: number;
          created_at: string;
          last_order_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          sku: string;
          category: string;
          description: string;
          price: number;
          stock: number;
          image_url: string;
          status: ProductStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string;
          status: OrderStatus;
          subtotal: number;
          shipping: number;
          tax: number;
          total: number;
          shipping_address: ShippingAddress;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          type: NotificationType;
          title: string;
          message: string;
          read: boolean;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      store_settings: {
        Row: {
          id: string;
          store_name: string;
          currency: string;
          timezone: string;
          accent_color: string;
          notify_orders: boolean;
          notify_low_stock: boolean;
          notify_customers: boolean;
        };
        Insert: Omit<Database['public']['Tables']['store_settings']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['store_settings']['Insert']>;
      };
    };
  };
}

export interface ShippingAddress {
  line1: string;
  city: string;
  state: string;
  zip: string;
}

// Enriched query result types
export type Order = Database['public']['Tables']['orders']['Row'] & {
  customer?: Database['public']['Tables']['customers']['Row'];
  items?: OrderItem[];
};

export type OrderItem = Database['public']['Tables']['order_items']['Row'] & {
  product?: Database['public']['Tables']['products']['Row'];
};

export type Product = Database['public']['Tables']['products']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type StoreSettings = Database['public']['Tables']['store_settings']['Row'];

export interface DashboardStats {
  totalRevenue: number;
  monthlySales: number;
  activeUsers: number;
  conversionRate: number;
  revenueChange: number;
  salesChange: number;
  usersChange: number;
  conversionChange: number;
}

export interface MonthlySeries {
  month: string;
  revenue: number;
  expenses: number;
}

export interface CategorySeries {
  category: string;
  sales: number;
  returns: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}
