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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      device_reports: {
        Row: {
          device_hash: string
          geohash: string | null
          id: string
          is_charging: boolean
          reported_at: string
          zone_id: string | null
        }
        Insert: {
          device_hash: string
          geohash?: string | null
          id?: string
          is_charging: boolean
          reported_at?: string
          zone_id?: string | null
        }
        Update: {
          device_hash?: string
          geohash?: string | null
          id?: string
          is_charging?: boolean
          reported_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_reports_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_prices: {
        Row: {
          avg_price: number | null
          fuel_type: string
          id: string
          max_price: number
          min_price: number
          updated_at: string
        }
        Insert: {
          avg_price?: number | null
          fuel_type: string
          id?: string
          max_price: number
          min_price: number
          updated_at?: string
        }
        Update: {
          avg_price?: number | null
          fuel_type?: string
          id?: string
          max_price?: number
          min_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      official_notices: {
        Row: {
          affected_zones: string[] | null
          content: string
          created_at: string
          id: string
          is_active: boolean
          notice_type: string
          scheduled_end: string | null
          scheduled_start: string | null
          source: string
          title: string
        }
        Insert: {
          affected_zones?: string[] | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          notice_type?: string
          scheduled_end?: string | null
          scheduled_start?: string | null
          source: string
          title: string
        }
        Update: {
          affected_zones?: string[] | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          notice_type?: string
          scheduled_end?: string | null
          scheduled_start?: string | null
          source?: string
          title?: string
        }
        Relationships: []
      }
      outage_history: {
        Row: {
          buddy_count: number
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          funny_caption: string | null
          id: string
          started_at: string
          zone_id: string
        }
        Insert: {
          buddy_count?: number
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          funny_caption?: string | null
          id?: string
          started_at: string
          zone_id: string
        }
        Update: {
          buddy_count?: number
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          funny_caption?: string | null
          id?: string
          started_at?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outage_history_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          device_hash: string | null
          feedback_type: string
          id: string
          reported_at: string
          zone_id: string | null
        }
        Insert: {
          device_hash?: string | null
          feedback_type: string
          id?: string
          reported_at?: string
          zone_id?: string | null
        }
        Update: {
          device_hash?: string | null
          feedback_type?: string
          id?: string
          reported_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      zone_power_status: {
        Row: {
          buddy_count: number
          confidence: string
          id: string
          last_change_at: string
          plugged_count: number
          status: string
          unplugged_count: number
          updated_at: string
          zone_id: string
        }
        Insert: {
          buddy_count?: number
          confidence?: string
          id?: string
          last_change_at?: string
          plugged_count?: number
          status?: string
          unplugged_count?: number
          updated_at?: string
          zone_id: string
        }
        Update: {
          buddy_count?: number
          confidence?: string
          id?: string
          last_change_at?: string
          plugged_count?: number
          status?: string
          unplugged_count?: number
          updated_at?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zone_power_status_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: true
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          created_at: string
          display_name: string
          geohash_prefix: string
          id: string
          latitude: number
          longitude: number
          name: string
        }
        Insert: {
          created_at?: string
          display_name: string
          geohash_prefix: string
          id?: string
          latitude: number
          longitude: number
          name: string
        }
        Update: {
          created_at?: string
          display_name?: string
          geohash_prefix?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
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
