"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { getBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Only the fields used in the form dropdown
type PlanOption = { id: string; name: string; display_name: string; price_usd: number };

const schema = z.object({
  name: z.string().min(1, "Requerido"),
  business_type: z.string().optional(),
  channel_phone_number: z.string().min(5, "Requerido"),
  plan_id: z.string().optional(),
  product_mode: z.enum(["inventory", "catalog"]),
  catalog_url: z.string().url("URL inválida").optional().or(z.literal("")),
  active: z.boolean(),
  sales_prompt: z.string().min(10, "El prompt es muy corto").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  plans: PlanOption[];
  defaultValues?: Partial<FormValues & { id: string; promptContent?: string }>;
  mode: "create" | "edit";
}

export function ClientForm({ plans, defaultValues, mode }: Props) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      business_type: defaultValues?.business_type ?? "",
      channel_phone_number: defaultValues?.channel_phone_number ?? "",
      plan_id: defaultValues?.plan_id ?? "",
      product_mode: defaultValues?.product_mode ?? "inventory",
      catalog_url: defaultValues?.catalog_url ?? "",
      active: defaultValues?.active ?? true,
      sales_prompt: defaultValues?.promptContent ?? "",
    },
  });

  const productMode = watch("product_mode");

  async function onSubmit(values: FormValues) {
    const supabase = getBrowserClient();

    try {
      if (mode === "create") {
        // 1. Create client
        const { data: client, error: clientError } = await supabase
          .from("clients")
          .insert({
            name: values.name,
            business_type: values.business_type || null,
            channel_phone_number: values.channel_phone_number,
            plan_id: values.plan_id || null,
            product_mode: values.product_mode,
            catalog_url: values.catalog_url || null,
            active: values.active,
          })
          .select()
          .single();

        if (clientError) throw clientError;

        // 2. Create sales prompt if provided
        if (values.sales_prompt && client) {
          const { data: prompt, error: promptError } = await supabase
            .from("agent_prompts")
            .insert({
              name: `Sales Agent — ${values.name}`,
              content: values.sales_prompt,
              agent_type: "sales",
              client_id: client.id,
              is_active: true,
              version: 1,
            })
            .select()
            .single();

          if (promptError) throw promptError;

          // Link prompt to client
          await supabase
            .from("clients")
            .update({ sales_prompt_id: prompt.id })
            .eq("id", client.id);
        }

        toast.success("Cliente creado exitosamente");
      } else {
        // Edit mode
        const { error: updateError } = await supabase
          .from("clients")
          .update({
            name: values.name,
            business_type: values.business_type || null,
            channel_phone_number: values.channel_phone_number,
            plan_id: values.plan_id || null,
            product_mode: values.product_mode,
            catalog_url: values.catalog_url || null,
            active: values.active,
          })
          .eq("id", defaultValues?.id ?? "");

        if (updateError) throw updateError;
        toast.success("Cliente actualizado");
      }

      router.push("/admin/clients");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre del negocio *</Label>
          <Input id="name" {...register("name")} placeholder="Ej: Tienda Moda XYZ" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="business_type">Tipo de negocio</Label>
          <Input
            id="business_type"
            {...register("business_type")}
            placeholder="Ej: Ropa deportiva"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="channel_phone_number">Teléfono del canal (WhatsApp) *</Label>
          <Input
            id="channel_phone_number"
            {...register("channel_phone_number")}
            placeholder="+573001234567"
          />
          {errors.channel_phone_number && (
            <p className="text-xs text-red-500">{errors.channel_phone_number.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="plan_id">Plan</Label>
          <Select
            defaultValue={defaultValues?.plan_id ?? ""}
            onValueChange={(v) => setValue("plan_id", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar plan" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.display_name} (${p.price_usd}/mo)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Modo de productos</Label>
          <Select
            defaultValue={productMode}
            onValueChange={(v) => setValue("product_mode", v as "inventory" | "catalog")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inventory">Inventario (DB)</SelectItem>
              <SelectItem value="catalog">Catálogo (URL)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {productMode === "catalog" && (
          <div className="space-y-1.5">
            <Label htmlFor="catalog_url">URL del catálogo</Label>
            <Input
              id="catalog_url"
              {...register("catalog_url")}
              placeholder="https://catalogo.mitienda.com"
            />
            {errors.catalog_url && (
              <p className="text-xs text-red-500">{errors.catalog_url.message}</p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Estado</Label>
          <Select
            defaultValue={defaultValues?.active !== false ? "true" : "false"}
            onValueChange={(v) => setValue("active", v === "true")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Activo</SelectItem>
              <SelectItem value="false">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sales_prompt">Prompt del agente de ventas</Label>
        <Textarea
          id="sales_prompt"
          {...register("sales_prompt")}
          placeholder="Eres un agente de ventas para..."
          rows={8}
          className="font-mono text-sm"
        />
        {errors.sales_prompt && (
          <p className="text-xs text-red-500">{errors.sales_prompt.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "create"
              ? "Creando..."
              : "Guardando..."
            : mode === "create"
            ? "Crear cliente"
            : "Guardar cambios"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/clients")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
