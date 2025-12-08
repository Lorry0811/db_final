// 資料庫類型定義
// 這個檔案可以透過 Supabase CLI 自動生成，或手動定義

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user: {
        Row: {
          u_id: number;
          email: string;
          username: string;
          password_hash: string;
          balance: number;
          is_admin: boolean;
          is_blocked: boolean;
          violation_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          u_id?: number;
          email: string;
          username: string;
          password_hash: string;
          balance?: number;
          is_admin?: boolean;
          is_blocked?: boolean;
          violation_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          u_id?: number;
          email?: string;
          username?: string;
          password_hash?: string;
          balance?: number;
          is_admin?: boolean;
          is_blocked?: boolean;
          violation_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      posting: {
        Row: {
          p_id: number;
          u_id: number;
          title: string;
          description: string | null;
          price: number;
          status: 'listed' | 'reserved' | 'sold' | 'reported' | 'removed';
          class_id: number | null;
          course_id: number | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          p_id?: number;
          u_id: number;
          title: string;
          description?: string | null;
          price: number;
          status?: 'listed' | 'reserved' | 'sold' | 'reported' | 'removed';
          class_id?: number | null;
          course_id?: number | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          p_id?: number;
          u_id?: number;
          title?: string;
          description?: string | null;
          price?: number;
          status?: 'listed' | 'reserved' | 'sold' | 'reported' | 'removed';
          class_id?: number | null;
          course_id?: number | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      posting_images: {
        Row: {
          image_id: number;
          p_id: number;
          image_url: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          image_id?: number;
          p_id: number;
          image_url: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          image_id?: number;
          p_id?: number;
          image_url?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      course: {
        Row: {
          course_id: number;
          course_code: string;
          course_name: string;
          dept_id: number | null;
          class_id: number | null;
          created_at: string;
        };
        Insert: {
          course_id?: number;
          course_code: string;
          course_name: string;
          dept_id?: number | null;
          class_id?: number | null;
          created_at?: string;
        };
        Update: {
          course_id?: number;
          course_code?: string;
          course_name?: string;
          dept_id?: number | null;
          class_id?: number | null;
          created_at?: string;
        };
      };
      class: {
        Row: {
          class_id: number;
          class_name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          class_id?: number;
          class_name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          class_id?: number;
          class_name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      department: {
        Row: {
          dept_id: number;
          dept_name: string;
          created_at: string;
        };
        Insert: {
          dept_id?: number;
          dept_name: string;
          created_at?: string;
        };
        Update: {
          dept_id?: number;
          dept_name?: string;
          created_at?: string;
        };
      };
      comment: {
        Row: {
          comment_id: number;
          p_id: number;
          u_id: number;
          content: string;
          created_at: string;
        };
        Insert: {
          comment_id?: number;
          p_id: number;
          u_id: number;
          content: string;
          created_at?: string;
        };
        Update: {
          comment_id?: number;
          p_id?: number;
          u_id?: number;
          content?: string;
          created_at?: string;
        };
      };
      report: {
        Row: {
          report_id: number;
          reporter_id: number;
          p_id: number;
          reason: string;
          status: 'pending' | 'approved' | 'rejected';
          reviewed_by: number | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          report_id?: number;
          reporter_id: number;
          p_id: number;
          reason: string;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: number | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          report_id?: number;
          reporter_id?: number;
          p_id?: number;
          reason?: string;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: number | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          order_id: number;
          buyer_id: number;
          p_id: number;
          deal_price: number;
          order_date: string;
          status: 'completed' | 'cancelled';
        };
        Insert: {
          order_id?: number;
          buyer_id: number;
          p_id: number;
          deal_price: number;
          order_date?: string;
          status?: 'completed' | 'cancelled';
        };
        Update: {
          order_id?: number;
          buyer_id?: number;
          p_id?: number;
          deal_price?: number;
          order_date?: string;
          status?: 'completed' | 'cancelled';
        };
      };
      transaction_record: {
        Row: {
          record_id: number;
          u_id: number;
          amount: number;
          trans_type: 'top_up' | 'payment' | 'income' | 'refund';
          trans_time: string;
        };
        Insert: {
          record_id?: number;
          u_id: number;
          amount: number;
          trans_type: 'top_up' | 'payment' | 'income' | 'refund';
          trans_time?: string;
        };
        Update: {
          record_id?: number;
          u_id?: number;
          amount?: number;
          trans_type?: 'top_up' | 'payment' | 'income' | 'refund';
          trans_time?: string;
        };
      };
      review: {
        Row: {
          review_id: number;
          order_id: number;
          reviewer_id: number;
          target_id: number;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          review_id?: number;
          order_id: number;
          reviewer_id: number;
          target_id: number;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          review_id?: number;
          order_id?: number;
          reviewer_id?: number;
          target_id?: number;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
      message: {
        Row: {
          msg_id: number;
          sender_id: number;
          receiver_id: number;
          content: string;
          sent_time: string;
          is_read: boolean;
        };
        Insert: {
          msg_id?: number;
          sender_id: number;
          receiver_id: number;
          content: string;
          sent_time?: string;
          is_read?: boolean;
        };
        Update: {
          msg_id?: number;
          sender_id?: number;
          receiver_id?: number;
          content?: string;
          sent_time?: string;
          is_read?: boolean;
        };
      };
      favorite_posts: {
        Row: {
          u_id: number;
          p_id: number;
          added_time: string;
        };
        Insert: {
          u_id: number;
          p_id: number;
          added_time?: string;
        };
        Update: {
          u_id?: number;
          p_id?: number;
          added_time?: string;
        };
      };
    };
    Views: {
      v_popular_books: {
        Row: {
          p_id: number;
          title: string;
          price: number;
          status: string;
          created_at: string;
          favorite_count: number;
          comment_count: number;
          seller_username: string | null;
          course_name: string | null;
          class_name: string | null;
        };
      };
      v_user_statistics: {
        Row: {
          u_id: number;
          username: string;
          email: string;
          balance: number;
          is_admin: boolean;
          is_blocked: boolean;
          violation_count: number;
          total_posts: number;
          sold_posts: number;
          total_orders_as_buyer: number;
          total_spent: number;
          total_earned: number;
          average_rating: number;
          review_count: number;
          favorite_count: number;
        };
      };
      v_course_statistics: {
        Row: {
          course_id: number;
          course_code: string;
          course_name: string;
          dept_name: string | null;
          class_name: string | null;
          total_postings: number;
          active_postings: number;
          sold_postings: number;
          average_price: number;
          min_price: number;
          max_price: number;
        };
      };
      v_class_statistics: {
        Row: {
          class_id: number;
          class_name: string;
          total_postings: number;
          active_postings: number;
          sold_postings: number;
          unique_sellers: number;
          total_revenue: number;
        };
      };
    };
    Functions: {
      purchase_book: {
        Args: {
          p_buyer_id: number;
          p_posting_id: number;
        };
        Returns: Json;
      };
      calculate_user_rating: {
        Args: {
          p_user_id: number;
        };
        Returns: number;
      };
      get_user_sales_stats: {
        Args: {
          p_user_id: number;
        };
        Returns: Json;
      };
    };
  };
}

