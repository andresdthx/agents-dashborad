// TypeScript types for the AgentsLeads Supabase database
// Relationships: [] required for Supabase JS v2 type inference

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          business_type: string | null;
          active: boolean;
          channel_phone_number: string;
          plan_id: string | null;
          product_mode: "inventory" | "catalog";
          catalog_url: string | null;
          llm_temperature: number;
          conversation_history_limit: number;
          sales_prompt_id: string | null;
          notification_phone: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          name: string;
          channel_phone_number: string;
          business_type?: string | null;
          active?: boolean;
          plan_id?: string | null;
          product_mode?: "inventory" | "catalog";
          catalog_url?: string | null;
          llm_temperature?: number;
          conversation_history_limit?: number;
          sales_prompt_id?: string | null;
          notification_phone?: string | null;
        };
        Update: {
          name?: string;
          channel_phone_number?: string;
          business_type?: string | null;
          active?: boolean;
          plan_id?: string | null;
          product_mode?: "inventory" | "catalog";
          catalog_url?: string | null;
          llm_temperature?: number;
          conversation_history_limit?: number;
          sales_prompt_id?: string | null;
          notification_phone?: string | null;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          phone: string;
          classification: "hot" | "warm" | "cold" | null;
          score: number | null;
          client_id: string | null;
          bot_paused: boolean;
          bot_paused_reason: string | null;
          bot_paused_at: string | null;
          resumed_at: string | null;
          status: "bot_active" | "human_active" | "resolved" | "lost";
          extracted_data: Record<string, unknown> | null;
          order_data: Record<string, unknown> | null;
          order_confirmed_at: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          phone: string;
          classification?: "hot" | "warm" | "cold" | null;
          score?: number | null;
          client_id?: string | null;
          bot_paused?: boolean;
          bot_paused_reason?: string | null;
          bot_paused_at?: string | null;
          resumed_at?: string | null;
          status?: "bot_active" | "human_active" | "resolved" | "lost";
          extracted_data?: Record<string, unknown> | null;
          order_data?: Record<string, unknown> | null;
        };
        Update: {
          phone?: string;
          classification?: "hot" | "warm" | "cold" | null;
          score?: number | null;
          client_id?: string | null;
          bot_paused?: boolean;
          bot_paused_reason?: string | null;
          bot_paused_at?: string | null;
          resumed_at?: string | null;
          status?: "bot_active" | "human_active" | "resolved" | "lost";
          extracted_data?: Record<string, unknown> | null;
          order_data?: Record<string, unknown> | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          lead_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          lead_id: string;
          role: "user" | "assistant";
          content: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [];
      };
      client_users: {
        Row: {
          id: string;
          user_id: string;
          client_id: string | null;
          role: "super_admin" | "client_agent";
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          client_id?: string | null;
          role: "super_admin" | "client_agent";
        };
        Update: {
          client_id?: string | null;
          role?: "super_admin" | "client_agent";
        };
        Relationships: [];
      };
      agent_prompts: {
        Row: {
          id: string;
          name: string;
          content: string;
          agent_type: "sales" | "intent" | "vision" | "classifier";
          client_id: string | null;
          is_active: boolean;
          version: number;
          description: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          name: string;
          content: string;
          agent_type: "sales" | "intent" | "vision" | "classifier";
          client_id?: string | null;
          is_active?: boolean;
          version?: number;
          description?: string | null;
        };
        Update: {
          name?: string;
          content?: string;
          agent_type?: "sales" | "intent" | "vision";
          client_id?: string | null;
          is_active?: boolean;
          version?: number;
          description?: string | null;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          price_usd: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          display_name: string;
          price_usd: number;
          is_active?: boolean;
        };
        Update: {
          display_name?: string;
          price_usd?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Functions: {
      toggle_bot_pause: {
        Args: {
          p_lead_id: string;
          p_bot_paused: boolean;
          p_reason: string | null;
        };
        Returns: {
          id: string;
          bot_paused: boolean;
          bot_paused_reason: string | null;
          bot_paused_at: string | null;
          resumed_at: string | null;
          status: "bot_active" | "human_active" | "resolved" | "lost";
          error?: string;
        };
      };
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Lead = Tables<"leads">;
export type Client = Tables<"clients">;
export type Message = Tables<"messages">;
export type ClientUser = Tables<"client_users">;
export type AgentPrompt = Tables<"agent_prompts">;
export type Plan = Tables<"plans">;
