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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      insight_items: {
        Row: {
          body: string
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          industry: string
          kind: string
          link_url: string | null
          position: number
          published: boolean
          summary: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          body?: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          industry: string
          kind: string
          link_url?: string | null
          position?: number
          published?: boolean
          summary?: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          industry?: string
          kind?: string
          link_url?: string | null
          position?: number
          published?: boolean
          summary?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_name: string
          body: string
          category: string
          cover_image_alt: string
          cover_image_url: string | null
          created_at: string
          excerpt: string
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author_name: string
          body?: string
          category: string
          cover_image_alt?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author_name?: string
          body?: string
          category?: string
          cover_image_alt?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_confirmed: boolean
          created_at: string
          full_name: string
          id: string
          mailchimp_lock_owner: string | null
          mailchimp_lock_until: string | null
          mailchimp_member: boolean
          mailchimp_resubscribe_pending: boolean
          mailchimp_survey_tagged: boolean
          mailchimp_synced_at: string | null
          mailchimp_synced_choice: boolean | null
          marketing_opt_in: boolean
          marketing_version: number
          updated_at: string
        }
        Insert: {
          age_confirmed?: boolean
          created_at?: string
          full_name?: string
          id: string
          mailchimp_lock_owner?: string | null
          mailchimp_lock_until?: string | null
          mailchimp_member?: boolean
          mailchimp_resubscribe_pending?: boolean
          mailchimp_survey_tagged?: boolean
          mailchimp_synced_at?: string | null
          mailchimp_synced_choice?: boolean | null
          marketing_opt_in?: boolean
          marketing_version?: number
          updated_at?: string
        }
        Update: {
          age_confirmed?: boolean
          created_at?: string
          full_name?: string
          id?: string
          mailchimp_lock_owner?: string | null
          mailchimp_lock_until?: string | null
          mailchimp_member?: boolean
          mailchimp_resubscribe_pending?: boolean
          mailchimp_survey_tagged?: boolean
          mailchimp_synced_at?: string | null
          mailchimp_synced_choice?: boolean | null
          marketing_opt_in?: boolean
          marketing_version?: number
          updated_at?: string
        }
        Relationships: []
      }
      rate_events: {
        Row: {
          at: string
          id: number
          ip: string
          kind: string
        }
        Insert: {
          at?: string
          id?: never
          ip: string
          kind: string
        }
        Update: {
          at?: string
          id?: never
          ip?: string
          kind?: string
        }
        Relationships: []
      }
      resource_clicks: {
        Row: {
          created_at: string
          id: number
          resource_id: string
          source_path: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          resource_id: string
          source_path?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          resource_id?: string
          source_path?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_clicks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          claim_token_hash: string | null
          confidence: number
          created_at: string
          id: string
          industries: string[]
          needs: string[]
          respondent_role: string
          source: string
          user_id: string | null
        }
        Insert: {
          claim_token_hash?: string | null
          confidence: number
          created_at?: string
          id?: string
          industries: string[]
          needs: string[]
          respondent_role: string
          source: string
          user_id?: string | null
        }
        Update: {
          claim_token_hash?: string | null
          confidence?: number
          created_at?: string
          id?: string
          industries?: string[]
          needs?: string[]
          respondent_role?: string
          source?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acquire_mailchimp_lock: {
        Args: { _owner: string; _seconds: number; _user: string }
        Returns: boolean
      }
      admin_click_counts: {
        Args: never
        Returns: {
          last_click_at: string
          resource_id: string
          signed_in_clicks: number
          total_clicks: number
          unique_users: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      rate_attempt: {
        Args: {
          p_ip: string
          p_kind: string
          p_max: number
          p_minutes: number
          p_record: boolean
        }
        Returns: boolean
      }
      release_mailchimp_lock: {
        Args: { _owner: string; _user: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
