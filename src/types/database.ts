// TypeScript types for the AgentsLeads Supabase database
// Relationships: [] required for Supabase JS v2 type inference

// Catalog column mapping — keys recognized by the backend in catalogSearch.ts
export type CatalogSystemKey =
  | "name"
  | "price"
  | "price_sede"
  | "price_domicilio"
  | "available"
  | "description"
  | "notes";

export type CatalogColMapping = Partial<Record<CatalogSystemKey, string>>;

/** Describes a single field the LLM must emit inside the RESERVA_INICIO/FIN block (migration 064). */
export interface ReservationOutputField {
  key: string;       // JSON key emitted by the LLM (e.g. "nombre_lead")
  label: string;     // Human-readable label for the admin UI
  required: boolean; // Whether the LLM must always provide this field
  hint: string;      // Instruction injected into the prompt for this field
}

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
          conversation_history_limit: number;
          sales_prompt_id: string | null;
          notification_phone: string | null;
          consult_catalog_url: string | null;
          show_catalog_url: string | null;
          debounce_ms: number | null;
          capabilities: Record<string, unknown> | null;
          keywords: unknown[] | null;
          brands: unknown[] | null;
          categories: unknown[] | null;
          business_description: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          name: string;
          channel_phone_number: string;
          business_type?: string | null;
          active?: boolean;
          plan_id?: string | null;
          conversation_history_limit?: number;
          sales_prompt_id?: string | null;
          notification_phone?: string | null;
          consult_catalog_url?: string | null;
          show_catalog_url?: string | null;
          debounce_ms?: number | null;
          capabilities?: Record<string, unknown> | null;
          keywords?: unknown[] | null;
          brands?: unknown[] | null;
          categories?: unknown[] | null;
          business_description?: string | null;
        };
        Update: {
          name?: string;
          channel_phone_number?: string;
          business_type?: string | null;
          active?: boolean;
          plan_id?: string | null;
          conversation_history_limit?: number;
          sales_prompt_id?: string | null;
          notification_phone?: string | null;
          consult_catalog_url?: string | null;
          show_catalog_url?: string | null;
          debounce_ms?: number | null;
          capabilities?: Record<string, unknown> | null;
          keywords?: unknown[] | null;
          brands?: unknown[] | null;
          categories?: unknown[] | null;
          business_description?: string | null;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          phone: string;
          name: string | null;
          classification: "hot" | "warm" | "cold" | null;
          score: number | null;
          client_id: string | null;
          bot_paused: boolean;
          bot_paused_reason: string | null;
          bot_paused_at: string | null;
          resumed_at: string | null;
          status: "bot_active" | "human_active" | "resolved" | "lost";
          handoff_mode: "urgent" | "requested" | "technical" | "observer" | null;
          handoff_reason: string | null;
          extracted_data: Record<string, unknown> | null;
          order_data: Record<string, unknown> | null;
          order_confirmed_at: string | null;
          reasoning: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          phone: string;
          name?: string | null;
          classification?: "hot" | "warm" | "cold" | null;
          score?: number | null;
          client_id?: string | null;
          bot_paused?: boolean;
          bot_paused_reason?: string | null;
          bot_paused_at?: string | null;
          resumed_at?: string | null;
          status?: "bot_active" | "human_active" | "resolved" | "lost";
          handoff_mode?: "urgent" | "requested" | "technical" | "observer" | null;
          handoff_reason?: string | null;
          extracted_data?: Record<string, unknown> | null;
          order_data?: Record<string, unknown> | null;
        };
        Update: {
          phone?: string;
          name?: string | null;
          classification?: "hot" | "warm" | "cold" | null;
          score?: number | null;
          client_id?: string | null;
          bot_paused?: boolean;
          bot_paused_reason?: string | null;
          bot_paused_at?: string | null;
          resumed_at?: string | null;
          status?: "bot_active" | "human_active" | "resolved" | "lost";
          handoff_mode?: "urgent" | "requested" | "technical" | "observer" | null;
          handoff_reason?: string | null;
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
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          name: string;
          content: string;
          agent_type: "sales" | "intent" | "vision" | "classifier";
          client_id?: string | null;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          content?: string;
          agent_type?: "sales" | "intent" | "vision" | "classifier";
          client_id?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          llm_model_id: string;
          price_usd: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          display_name: string;
          llm_model_id: string;
          price_usd: number;
          is_active?: boolean;
        };
        Update: {
          display_name?: string;
          llm_model_id?: string;
          price_usd?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      client_faqs: {
        Row: {
          id: string;
          client_id: string;
          question: string;
          answer: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          question: string;
          answer: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          question?: string;
          answer?: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      client_catalog_config: {
        Row: {
          id: string;
          client_id: string;
          col_mapping: CatalogColMapping;
          extra_fields: { column: string; label: string }[];
          info_sheet_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          col_mapping?: CatalogColMapping;
          extra_fields?: { column: string; label: string }[];
          info_sheet_url?: string | null;
        };
        Update: {
          col_mapping?: CatalogColMapping;
          extra_fields?: { column: string; label: string }[];
          info_sheet_url?: string | null;
        };
        Relationships: [];
      };
      client_reservation_config: {
        Row: {
          id: string;
          client_id: string;
          output_fields: ReservationOutputField[];
          block_enabled: boolean;
          /** Free-text example of the confirmation message. Injected into <BloqueReserva> at runtime (migration 065). */
          confirmation_example: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          output_fields?: ReservationOutputField[];
          block_enabled?: boolean;
          confirmation_example?: string;
        };
        Update: {
          output_fields?: ReservationOutputField[];
          block_enabled?: boolean;
          confirmation_example?: string;
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
          handoff_mode: "urgent" | "requested" | "technical" | "observer" | null;
          error?: string;
        };
      };
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type ClientCatalogConfig = Tables<"client_catalog_config">;

export type Lead = Tables<"leads">;
export type Client = Tables<"clients">;
export type Message = Tables<"messages">;
export type ClientUser = Tables<"client_users">;
export type AgentPrompt = Tables<"agent_prompts">;
export type Plan = Tables<"plans">;
export type ClientFaq = Tables<"client_faqs">;
export type ClientReservationConfig = Tables<"client_reservation_config">;
