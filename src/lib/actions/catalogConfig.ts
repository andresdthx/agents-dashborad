"use server";

import { createServiceClient } from "@/lib/supabase/service";
import type { CatalogColMapping } from "@/types/database";

export interface CatalogConfigInput {
  col_mapping: CatalogColMapping;
}

const MAX_COL_MAPPING_ENTRIES = 10;

export async function getCatalogConfig(
  clientId: string
): Promise<{ config: CatalogConfigInput | null; error: string | null }> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("client_catalog_config")
    .select("col_mapping")
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) return { config: null, error: error.message };
  if (!data) return { config: null, error: null };

  return {
    config: { col_mapping: (data.col_mapping ?? {}) as CatalogColMapping },
    error: null,
  };
}

export async function saveCatalogConfig(
  clientId: string,
  config: CatalogConfigInput
): Promise<{ error: string | null }> {
  const entries = Object.entries(config.col_mapping).filter(
    ([, v]) => v !== undefined
  );

  if (entries.length > MAX_COL_MAPPING_ENTRIES) {
    return { error: `Máximo ${MAX_COL_MAPPING_ENTRIES} columnas permitidas` };
  }

  for (const [, value] of entries) {
    if (!value?.trim()) {
      return { error: "Ningún nombre de columna puede estar vacío" };
    }
  }

  const supabase = createServiceClient();

  const { error } = await supabase
    .from("client_catalog_config")
    .upsert(
      { client_id: clientId, col_mapping: config.col_mapping },
      { onConflict: "client_id" }
    );

  if (error) return { error: error.message };
  return { error: null };
}
