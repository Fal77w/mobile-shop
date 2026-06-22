import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const warehouseSchema = z.object({
  name: z.string().min(1).max(100),
});

export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  warehouseId: z.string().min(1),
  parentId: z.string().optional().nullable(),
});

export const productSchema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().max(50).optional().nullable(),
  barcode: z.string().max(50).optional().nullable(),
  categoryId: z.string().min(1),
  warehouseId: z.string().min(1),
  costPrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(0).default(0),
  lowStockAlert: z.coerce.number().int().min(0).default(5),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
});

export const completeSaleSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  paymentMethod: z.enum(["CASH", "CARD", "ON_ACCOUNT"]),
  customerId: z.string().optional().nullable(),
  customerName: z.string().max(200).optional().nullable(),
});

export const purchaseItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  costPrice: z.coerce.number().min(0),
});

export const purchaseSchema = z.object({
  supplierName: z.string().min(1).max(200),
  supplierInvoiceNo: z.string().max(100).optional().nullable(),
  date: z.string().min(1),
  items: z.array(purchaseItemSchema).min(1),
});

export const saleReturnItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  refundAmount: z.coerce.number().min(0),
});

export const saleReturnSchema = z.object({
  saleId: z.string().min(1, "Related sale is required"),
  date: z.string().min(1),
  notes: z.string().max(500).optional().nullable(),
  items: z.array(saleReturnItemSchema).min(1),
});

export const purchaseReturnItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
});

export const purchaseReturnSchema = z.object({
  purchaseId: z.string().min(1, "Related purchase is required"),
  date: z.string().min(1),
  notes: z.string().max(500).optional().nullable(),
  items: z.array(purchaseReturnItemSchema).min(1),
});

export const expenseSchema = z.object({
  title: z.string().min(1).max(200),
  amount: z.coerce.number().min(0.01),
  date: z.string().min(1),
  notes: z.string().max(500).optional().nullable(),
});

export const customerSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().max(30).optional().nullable(),
});

export const paymentSchema = z.object({
  customerId: z.string().min(1),
  amount: z.coerce.number().min(0.01),
  date: z.string().min(1),
  notes: z.string().max(500).optional().nullable(),
});

export const stockTransferSchema = z.object({
  fromWarehouseId: z.string().min(1),
  toWarehouseId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  notes: z.string().max(500).optional().nullable(),
});

export const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "ACCOUNTANT", "SALES", "EMPLOYEE"]),
});

export const repairOrderSchema = z.object({
  customerName: z.string().min(1).max(200),
  phone: z.string().min(1).max(30),
  deviceType: z.string().min(1).max(100),
  issue: z.string().min(1).max(500),
  cost: z.coerce.number().min(0),
  notes: z.string().max(500).optional().nullable(),
});

export const programmingOrderSchema = z.object({
  customerName: z.string().min(1).max(200),
  phone: z.string().min(1).max(30),
  deviceType: z.string().min(1).max(100),
  serviceType: z.string().min(1).max(200),
  cost: z.coerce.number().min(0),
  notes: z.string().max(500).optional().nullable(),
});

export const shopSettingsSchema = z.object({
  shopName: z.string().min(1).max(200),
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  invoicePrefix: z.string().min(1).max(20),
  invoiceFooter: z.string().max(500).optional().nullable(),
  invoiceShowBarcode: z.coerce.boolean().optional(),
});

export function parseFormData<T extends z.ZodType>(
  schema: T,
  formData: FormData
): z.SafeParseReturnType<unknown, z.infer<T>> {
  const obj: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    obj[key] = value;
  });
  return schema.safeParse(obj);
}

export function parseJsonField<T>(
  value: FormDataEntryValue | null,
  fallback: T
): T {
  if (!value || typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
