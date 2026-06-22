"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import {
  customerSchema,
  paymentSchema,
  expenseSchema,
  parseFormData,
} from "@/lib/validations";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  recordPayment,
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/lib/application/services/customer-service";
import type { ActionResult } from "@/lib/domain/action-result";

export async function createCustomerAction(formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseFormData(customerSchema, formData);
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    const customer = await createCustomer(parsed.data);
    revalidatePath("/customers");
    return { success: true, id: customer.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function updateCustomerAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseFormData(customerSchema, formData);
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    await updateCustomer(id, parsed.data);
    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function deleteCustomerAction(id: string): Promise<ActionResult> {
  try {
    await requireUser();
    await deleteCustomer(id);
    revalidatePath("/customers");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function recordPaymentAction(formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseFormData(paymentSchema, formData);
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    await recordPayment({
      ...parsed.data,
      date: new Date(parsed.data.date),
    });
    revalidatePath("/customers");
    revalidatePath(`/customers/${parsed.data.customerId}`);
    revalidatePath("/reports");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function createExpenseAction(formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseFormData(expenseSchema, formData);
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    await createExpense({
      ...parsed.data,
      date: new Date(parsed.data.date),
    });
    revalidatePath("/expenses");
    revalidatePath("/reports");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function updateExpenseAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseFormData(expenseSchema, formData);
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    await updateExpense(id, {
      ...parsed.data,
      date: new Date(parsed.data.date),
    });
    revalidatePath("/expenses");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function deleteExpenseAction(id: string): Promise<ActionResult> {
  try {
    await requireUser();
    await deleteExpense(id);
    revalidatePath("/expenses");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}
