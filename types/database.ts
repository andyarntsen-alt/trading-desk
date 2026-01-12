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
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string | null
          trader_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email?: string | null
          trader_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string | null
          trader_name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          starting_balance: number
          current_balance: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category?: string
          starting_balance?: number
          current_balance?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          starting_balance?: number
          current_balance?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      trades: {
        Row: {
          id: string
          user_id: string
          account_id: string | null
          symbol: string
          direction: 'long' | 'short' | null
          entry_price: number | null
          exit_price: number | null
          quantity: number | null
          pnl: number | null
          fees: number
          notes: string | null
          tags: string[] | null
          screenshot_url: string | null
          trade_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id?: string | null
          symbol: string
          direction?: 'long' | 'short' | null
          entry_price?: number | null
          exit_price?: number | null
          quantity?: number | null
          pnl?: number | null
          fees?: number
          notes?: string | null
          tags?: string[] | null
          screenshot_url?: string | null
          trade_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string | null
          symbol?: string
          direction?: 'long' | 'short' | null
          entry_price?: number | null
          exit_price?: number | null
          quantity?: number | null
          pnl?: number | null
          fees?: number
          notes?: string | null
          tags?: string[] | null
          screenshot_url?: string | null
          trade_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          }
        ]
      }
      playbook_setups: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          rules: string[] | null
          screenshot_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          rules?: string[] | null
          screenshot_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          rules?: string[] | null
          screenshot_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_setups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      daily_archives: {
        Row: {
          id: string
          user_id: string
          archive_date: string
          prep_data: Json | null
          checklist_data: Json | null
          review_data: Json | null
          screenshots: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          archive_date: string
          prep_data?: Json | null
          checklist_data?: Json | null
          review_data?: Json | null
          screenshots?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          archive_date?: string
          prep_data?: Json | null
          checklist_data?: Json | null
          review_data?: Json | null
          screenshots?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_archives_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          theme: Json
          goals: Json | null
          daily_loss_limit: Json | null
          tilt_settings: Json | null
          widget_settings: Json | null
          prep_config: Json | null
          checklist_config: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          theme?: Json
          goals?: Json | null
          daily_loss_limit?: Json | null
          tilt_settings?: Json | null
          widget_settings?: Json | null
          prep_config?: Json | null
          checklist_config?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          theme?: Json
          goals?: Json | null
          daily_loss_limit?: Json | null
          tilt_settings?: Json | null
          widget_settings?: Json | null
          prep_config?: Json | null
          checklist_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      symbols: {
        Row: {
          id: string
          user_id: string
          symbol: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "symbols_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

// Helper types
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

// Legacy helper types for backwards compatibility
export type InsertTables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"]
export type UpdateTables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"]
