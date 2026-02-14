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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      email_preferences: {
        Row: {
          created_at: string
          data_migrated_at: string | null
          id: string
          privacy_mode_enabled: boolean
          tool_notifications_enabled: boolean
          updated_at: string
          user_id: string
          weekly_summary_enabled: boolean
        }
        Insert: {
          created_at?: string
          data_migrated_at?: string | null
          id?: string
          privacy_mode_enabled?: boolean
          tool_notifications_enabled?: boolean
          updated_at?: string
          user_id: string
          weekly_summary_enabled?: boolean
        }
        Update: {
          created_at?: string
          data_migrated_at?: string | null
          id?: string
          privacy_mode_enabled?: boolean
          tool_notifications_enabled?: boolean
          updated_at?: string
          user_id?: string
          weekly_summary_enabled?: boolean
        }
        Relationships: []
      }
      ip_rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          activities: string[]
          after_anxiety: number | null
          after_energy: number | null
          after_focus: number | null
          after_mood: number | null
          after_pain: number | null
          before_anxiety: number | null
          before_energy: number | null
          before_focus: number | null
          before_mood: number | null
          before_notes: string | null
          before_pain: number | null
          cbd_percentage: number | null
          cbd_weight: number | null
          consumption_time: string | null
          created_at: string
          dosage: string
          dosage_unit: string | null
          effects_duration_minutes: number | null
          encrypted_data: string | null
          encrypted_payload: string | null
          encryption_iv: string | null
          encryption_version: number | null
          entry_status: string | null
          icon: string | null
          id: string
          is_deleted: boolean
          is_encrypted: boolean | null
          method: string
          negative_side_effects: string[]
          notes: string | null
          observations: string[]
          strain: string
          strain_2: string | null
          thc_percentage: number | null
          thc_weight: number | null
          user_id: string
          wrapped_aes_key: string | null
        }
        Insert: {
          activities?: string[]
          after_anxiety?: number | null
          after_energy?: number | null
          after_focus?: number | null
          after_mood?: number | null
          after_pain?: number | null
          before_anxiety?: number | null
          before_energy?: number | null
          before_focus?: number | null
          before_mood?: number | null
          before_notes?: string | null
          before_pain?: number | null
          cbd_percentage?: number | null
          cbd_weight?: number | null
          consumption_time?: string | null
          created_at?: string
          dosage: string
          dosage_unit?: string | null
          effects_duration_minutes?: number | null
          encrypted_data?: string | null
          encrypted_payload?: string | null
          encryption_iv?: string | null
          encryption_version?: number | null
          entry_status?: string | null
          icon?: string | null
          id?: string
          is_deleted?: boolean
          is_encrypted?: boolean | null
          method: string
          negative_side_effects?: string[]
          notes?: string | null
          observations?: string[]
          strain: string
          strain_2?: string | null
          thc_percentage?: number | null
          thc_weight?: number | null
          user_id: string
          wrapped_aes_key?: string | null
        }
        Update: {
          activities?: string[]
          after_anxiety?: number | null
          after_energy?: number | null
          after_focus?: number | null
          after_mood?: number | null
          after_pain?: number | null
          before_anxiety?: number | null
          before_energy?: number | null
          before_focus?: number | null
          before_mood?: number | null
          before_notes?: string | null
          before_pain?: number | null
          cbd_percentage?: number | null
          cbd_weight?: number | null
          consumption_time?: string | null
          created_at?: string
          dosage?: string
          dosage_unit?: string | null
          effects_duration_minutes?: number | null
          encrypted_data?: string | null
          encrypted_payload?: string | null
          encryption_iv?: string | null
          encryption_version?: number | null
          entry_status?: string | null
          icon?: string | null
          id?: string
          is_deleted?: boolean
          is_encrypted?: boolean | null
          method?: string
          negative_side_effects?: string[]
          notes?: string | null
          observations?: string[]
          strain?: string
          strain_2?: string | null
          thc_percentage?: number | null
          thc_weight?: number | null
          user_id?: string
          wrapped_aes_key?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          clinician_verified: boolean | null
          created_at: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          clinician_verified?: boolean | null
          created_at?: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          clinician_verified?: boolean | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          request_count?: number
          user_id: string
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          recurrence: string
          reminder_time: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          recurrence?: string
          reminder_time: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          recurrence?: string
          reminder_time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      tool_usage: {
        Row: {
          created_at: string
          id: string
          last_used_at: string
          tool_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_used_at?: string
          tool_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_used_at?: string
          tool_id?: string
          user_id?: string
        }
        Relationships: []
      }
      e2ee_vault: {
        Row: {
          created_at: string
          password_salt: string
          public_key: string
          updated_at: string
          user_id: string
          vault_version: number
          wrapped_private_key: string
        }
        Insert: {
          created_at?: string
          password_salt: string
          public_key: string
          updated_at?: string
          user_id: string
          vault_version?: number
          wrapped_private_key: string
        }
        Update: {
          created_at?: string
          password_salt?: string
          public_key?: string
          updated_at?: string
          user_id?: string
          vault_version?: number
          wrapped_private_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "e2ee_vault_user_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_encryption_salts: {
        Row: {
          created_at: string
          encrypted_private_key: string | null
          key_version: number
          password_salt: string
          private_key_version: number | null
          public_key: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_private_key?: string | null
          key_version?: number
          password_salt: string
          private_key_version?: number | null
          public_key?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_private_key?: string | null
          key_version?: number
          password_salt?: string
          private_key_version?: number | null
          public_key?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_ip_rate_limits: { Args: never; Returns: undefined }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
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
