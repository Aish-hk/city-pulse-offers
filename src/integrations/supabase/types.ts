export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      demo_overrides: {
        Row: {
          id: string
          location_override: Json | null
          time_override: string | null
          weather_override: string | null
        }
        Insert: {
          id?: string
          location_override?: Json | null
          time_override?: string | null
          weather_override?: string | null
        }
        Update: {
          id?: string
          location_override?: Json | null
          time_override?: string | null
          weather_override?: string | null
        }
        Relationships: []
      }
      merchant_insights: {
        Row: {
          context_snapshot: Json | null
          created_at: string | null
          diagnosis: string
          id: string
          merchant_id: string | null
          suggested_action: string
        }
        Insert: {
          context_snapshot?: Json | null
          created_at?: string | null
          diagnosis: string
          id?: string
          merchant_id?: string | null
          suggested_action: string
        }
        Update: {
          context_snapshot?: Json | null
          created_at?: string | null
          diagnosis?: string
          id?: string
          merchant_id?: string | null
          suggested_action?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_insights_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_rules: {
        Row: {
          active_days: number[] | null
          active_window_end: string | null
          active_window_start: string | null
          created_at: string | null
          goal_text_input: string | null
          goal_type: string
          id: string
          inventory_tag: string | null
          is_active: boolean | null
          max_discount_pct: number | null
          merchant_id: string | null
          min_discount_pct: number | null
          trigger_conditions: Json | null
        }
        Insert: {
          active_days?: number[] | null
          active_window_end?: string | null
          active_window_start?: string | null
          created_at?: string | null
          goal_text_input?: string | null
          goal_type: string
          id?: string
          inventory_tag?: string | null
          is_active?: boolean | null
          max_discount_pct?: number | null
          merchant_id?: string | null
          min_discount_pct?: number | null
          trigger_conditions?: Json | null
        }
        Update: {
          active_days?: number[] | null
          active_window_end?: string | null
          active_window_start?: string | null
          created_at?: string | null
          goal_text_input?: string | null
          goal_type?: string
          id?: string
          inventory_tag?: string | null
          is_active?: boolean | null
          max_discount_pct?: number | null
          merchant_id?: string | null
          min_discount_pct?: number | null
          trigger_conditions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_rules_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          address: string | null
          brand_voice: string | null
          category: string
          created_at: string | null
          icon_name: string | null
          id: string
          lat: number
          lng: number
          name: string
        }
        Insert: {
          address?: string | null
          brand_voice?: string | null
          category: string
          created_at?: string | null
          icon_name?: string | null
          id?: string
          lat: number
          lng: number
          name: string
        }
        Update: {
          address?: string | null
          brand_voice?: string | null
          category?: string
          created_at?: string | null
          icon_name?: string | null
          id?: string
          lat?: number
          lng?: number
          name?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          body: string
          context_snapshot: Json | null
          created_at: string | null
          cta: string
          discount_pct: number
          expires_at: string
          headline: string
          id: string
          merchant_id: string | null
          relevance_score: number | null
          rule_id: string | null
          status: string | null
          urgency_reason: string
          user_session_id: string | null
        }
        Insert: {
          body: string
          context_snapshot?: Json | null
          created_at?: string | null
          cta: string
          discount_pct: number
          expires_at: string
          headline: string
          id?: string
          merchant_id?: string | null
          relevance_score?: number | null
          rule_id?: string | null
          status?: string | null
          urgency_reason: string
          user_session_id?: string | null
        }
        Update: {
          body?: string
          context_snapshot?: Json | null
          created_at?: string | null
          cta?: string
          discount_pct?: number
          expires_at?: string
          headline?: string
          id?: string
          merchant_id?: string | null
          relevance_score?: number | null
          rule_id?: string | null
          status?: string | null
          urgency_reason?: string
          user_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "merchant_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      redemptions: {
        Row: {
          id: string
          offer_id: string | null
          redeemed_at: string | null
          simulated_amount_pence: number | null
          user_session_id: string | null
        }
        Insert: {
          id?: string
          offer_id?: string | null
          redeemed_at?: string | null
          simulated_amount_pence?: number | null
          user_session_id?: string | null
        }
        Update: {
          id?: string
          offer_id?: string | null
          redeemed_at?: string | null
          simulated_amount_pence?: number | null
          user_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          current_lat: number | null
          current_lng: number | null
          session_id: string
        }
        Insert: {
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          session_id: string
        }
        Update: {
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          session_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
