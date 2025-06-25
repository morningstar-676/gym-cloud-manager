export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attendance_logs: {
        Row: {
          branch_id: string
          check_in_time: string
          check_out_time: string | null
          gym_id: string
          id: string
          member_id: string
          notes: string | null
          scanned_by: string | null
        }
        Insert: {
          branch_id: string
          check_in_time?: string
          check_out_time?: string | null
          gym_id: string
          id?: string
          member_id: string
          notes?: string | null
          scanned_by?: string | null
        }
        Update: {
          branch_id?: string
          check_in_time?: string
          check_out_time?: string | null
          gym_id?: string
          id?: string
          member_id?: string
          notes?: string | null
          scanned_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_logs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_logs_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_logs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_logs_scanned_by_fkey"
            columns: ["scanned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          gym_id: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          gym_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          gym_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string
          city: string | null
          created_at: string
          email: string | null
          gym_id: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address: string
          city?: string | null
          created_at?: string
          email?: string | null
          gym_id: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string | null
          created_at?: string
          email?: string | null
          gym_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      class_bookings: {
        Row: {
          attended_at: string | null
          booked_at: string
          class_id: string
          gym_id: string
          id: string
          member_id: string
          status: Database["public"]["Enums"]["booking_status"] | null
        }
        Insert: {
          attended_at?: string | null
          booked_at?: string
          class_id: string
          gym_id: string
          id?: string
          member_id: string
          status?: Database["public"]["Enums"]["booking_status"] | null
        }
        Update: {
          attended_at?: string | null
          booked_at?: string
          class_id?: string
          gym_id?: string
          id?: string
          member_id?: string
          status?: Database["public"]["Enums"]["booking_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "class_bookings_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_bookings_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_bookings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          branch_id: string
          class_date: string
          created_at: string
          current_bookings: number | null
          description: string | null
          end_time: string
          gym_id: string
          id: string
          max_capacity: number | null
          name: string
          start_time: string
          status: Database["public"]["Enums"]["class_status"] | null
          trainer_id: string | null
          updated_at: string
        }
        Insert: {
          branch_id: string
          class_date: string
          created_at?: string
          current_bookings?: number | null
          description?: string | null
          end_time: string
          gym_id: string
          id?: string
          max_capacity?: number | null
          name: string
          start_time: string
          status?: Database["public"]["Enums"]["class_status"] | null
          trainer_id?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string
          class_date?: string
          created_at?: string
          current_bookings?: number | null
          description?: string | null
          end_time?: string
          gym_id?: string
          id?: string
          max_capacity?: number | null
          name?: string
          start_time?: string
          status?: Database["public"]["Enums"]["class_status"] | null
          trainer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_library: {
        Row: {
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          created_by: string | null
          description: string | null
          file_url: string
          gym_id: string
          id: string
          is_public: boolean | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_url: string
          gym_id: string
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_url?: string
          gym_id?: string
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_library_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_library_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      default_workout_plans: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          gym_id: string
          id: string
          is_active: boolean | null
          name: string
          plan_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          gym_id: string
          id?: string
          is_active?: boolean | null
          name: string
          plan_data?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          gym_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          plan_data?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "default_workout_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "default_workout_plans_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          gym_id: string
          id: string
          is_active: boolean | null
          plan_id: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          gym_id: string
          id?: string
          is_active?: boolean | null
          plan_id: string
          start_date?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          gym_id?: string
          id?: string
          is_active?: boolean | null
          plan_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_subscriptions_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      gyms: {
        Row: {
          address: string | null
          banner_url: string | null
          city: string | null
          country: string | null
          created_at: string
          custom_domain: string | null
          email: string
          gym_code: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          postal_code: string | null
          state: string | null
          theme_color: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          custom_domain?: string | null
          email: string
          gym_code?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          theme_color?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          custom_domain?: string | null
          email?: string
          gym_code?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          theme_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      member_subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          gym_id: string
          id: string
          is_active: boolean | null
          member_id: string
          plan_name: string
          price: number | null
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          gym_id: string
          id?: string
          is_active?: boolean | null
          member_id: string
          plan_name: string
          price?: number | null
          start_date?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          gym_id?: string
          id?: string
          is_active?: boolean | null
          member_id?: string
          plan_name?: string
          price?: number | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_subscriptions_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_subscriptions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          gym_id: string
          id: string
          is_read: boolean | null
          message: string
          recipient_id: string | null
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string
          gym_id: string
          id?: string
          is_read?: boolean | null
          message: string
          recipient_id?: string | null
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string
          gym_id?: string
          id?: string
          is_read?: boolean | null
          message?: string
          recipient_id?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          branch_id: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          first_name: string | null
          gym_id: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          member_code: string | null
          phone: string | null
          qr_code: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          first_name?: string | null
          gym_id?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          member_code?: string | null
          phone?: string | null
          qr_code?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          first_name?: string | null
          gym_id?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          member_code?: string | null
          phone?: string | null
          qr_code?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          billing_cycle: string
          created_at: string
          features: Json
          id: string
          is_active: boolean | null
          max_branches: number | null
          max_members: number | null
          name: string
          price: number
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean | null
          max_branches?: number | null
          max_members?: number | null
          name: string
          price: number
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean | null
          max_branches?: number | null
          max_members?: number | null
          name?: string
          price?: number
          tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Relationships: []
      }
      workout_programs: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          gym_id: string
          id: string
          is_active: boolean | null
          member_id: string
          name: string
          program_data: Json
          start_date: string | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          gym_id: string
          id?: string
          is_active?: boolean | null
          member_id: string
          name: string
          program_data?: Json
          start_date?: string | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          gym_id?: string
          id?: string
          is_active?: boolean | null
          member_id?: string
          name?: string
          program_data?: Json
          start_date?: string | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_programs_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_programs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_programs_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_member_code: {
        Args: { gym_id_param: string }
        Returns: string
      }
      get_current_user_gym_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_gym_count_for_code: {
        Args: { code: string }
        Returns: number
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      booking_status: "confirmed" | "waitlisted" | "cancelled"
      class_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      content_type: "video" | "pdf" | "image" | "document"
      subscription_tier: "startup" | "growth" | "enterprise"
      user_role: "super_admin" | "gym_admin" | "trainer" | "staff" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: ["confirmed", "waitlisted", "cancelled"],
      class_status: ["scheduled", "in_progress", "completed", "cancelled"],
      content_type: ["video", "pdf", "image", "document"],
      subscription_tier: ["startup", "growth", "enterprise"],
      user_role: ["super_admin", "gym_admin", "trainer", "staff", "member"],
    },
  },
} as const
