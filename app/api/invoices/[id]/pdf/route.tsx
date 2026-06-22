import { NextResponse } from "next/server";
import path from "path";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  renderToBuffer,
} from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { getInvoiceData } from "@/lib/application/services/invoice-service";
import { registerPdfFonts } from "@/lib/pdf/register-fonts";
import { formatDate, formatMoney, toNumber } from "@/lib/utils";

const FONT = "NotoSansArabic";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: FONT,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#4f46e5",
    paddingBottom: 16,
  },
  shopBlock: { flex: 1 },
  shopName: {
    fontSize: 22,
    fontFamily: FONT,
    fontWeight: 700,
    marginBottom: 4,
    color: "#1e1b4b",
  },
  shopMeta: { fontSize: 10, color: "#52525b", marginBottom: 2 },
  logo: { width: 72, height: 72, objectFit: "contain" },
  title: {
    fontSize: 16,
    fontFamily: FONT,
    fontWeight: 700,
    marginBottom: 16,
    textAlign: "center",
    color: "#4f46e5",
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "#f4f4f5",
    padding: 10,
    borderRadius: 4,
  },
  barcodeBox: {
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#d4d4d8",
    alignItems: "center",
  },
  barcodeText: {
    fontFamily: FONT,
    fontSize: 14,
    letterSpacing: 2,
  },
  table: { marginTop: 4 },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#4f46e5",
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 4,
    fontWeight: 700,
  },
  colItem: { flex: 3, paddingHorizontal: 4 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.5, textAlign: "right", paddingHorizontal: 4 },
  colTotal: { flex: 1.5, textAlign: "right", paddingHorizontal: 4 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#4f46e5",
  },
  totalLabel: { fontSize: 14, fontWeight: 700, marginRight: 16 },
  totalValue: { fontSize: 16, fontWeight: 700, color: "#4f46e5" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#71717a",
    borderTopWidth: 1,
    borderTopColor: "#e4e4e7",
    paddingTop: 8,
  },
});

function InvoiceDocument({
  shopName,
  phone,
  address,
  logoUrl,
  invoiceNumber,
  date,
  customer,
  paymentMethod,
  items,
  total,
  footer,
  showBarcode,
}: {
  shopName: string;
  phone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  invoiceNumber: string;
  date: string;
  customer: string;
  paymentMethod: string;
  items: { name: string; quantity: number; unitPrice: number; lineTotal: number }[];
  total: number;
  footer?: string | null;
  showBarcode: boolean;
}) {
  const logoSrc = logoUrl?.startsWith("/")
    ? path.join(process.cwd(), "public", logoUrl.replace(/^\//, ""))
    : logoUrl;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.shopBlock}>
            <Text style={styles.shopName}>{shopName}</Text>
            {phone ? <Text style={styles.shopMeta}>هاتف: {phone}</Text> : null}
            {address ? <Text style={styles.shopMeta}>{address}</Text> : null}
          </View>
          {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : null}
        </View>

        <Text style={styles.title}>فاتورة مبيعات</Text>

        {showBarcode ? (
          <View style={styles.barcodeBox}>
            <Text style={{ fontSize: 9, marginBottom: 4 }}>رقم الفاتورة</Text>
            <Text style={styles.barcodeText}>{invoiceNumber}</Text>
          </View>
        ) : null}

        <View style={styles.meta}>
          <View>
            <Text>رقم الفاتورة: {invoiceNumber}</Text>
            <Text>التاريخ: {date}</Text>
            <Text>طريقة الدفع: {paymentMethod}</Text>
          </View>
          <View>
            <Text>العميل: {customer}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={styles.colItem}>المنتج</Text>
            <Text style={styles.colQty}>الكمية</Text>
            <Text style={styles.colPrice}>السعر</Text>
            <Text style={styles.colTotal}>المجموع</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.colItem}>{item.name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatMoney(item.unitPrice)}</Text>
              <Text style={styles.colTotal}>{formatMoney(item.lineTotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>الإجمالي:</Text>
          <Text style={styles.totalValue}>{formatMoney(total)}</Text>
        </View>

        {footer ? <Text style={styles.footer}>{footer}</Text> : null}
      </Page>
    </Document>
  );
}

const paymentAr: Record<string, string> = {
  CASH: "نقداً",
  CARD: "بطاقة",
  ON_ACCOUNT: "آجل",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const data = await getInvoiceData(id);
  if (!data?.sale) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  registerPdfFonts();

  const { settings, sale } = data;
  const doc = (
    <InvoiceDocument
      shopName={settings?.shopName ?? "متجر الموبايلات"}
      phone={settings?.phone}
      address={settings?.address}
      logoUrl={settings?.logoUrl}
      invoiceNumber={sale.invoiceNumber}
      date={formatDate(sale.createdAt)}
      customer={sale.customer?.name ?? sale.customerName ?? "عميل نقدي"}
      paymentMethod={paymentAr[sale.paymentMethod] ?? sale.paymentMethod}
      items={sale.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        unitPrice: toNumber(item.unitPrice),
        lineTotal: toNumber(item.lineTotal),
      }))}
      total={toNumber(sale.total)}
      footer={settings?.invoiceFooter}
      showBarcode={settings?.invoiceShowBarcode ?? true}
    />
  );

  const pdfBuffer = await renderToBuffer(doc);
  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${sale.invoiceNumber}.pdf"`,
    },
  });
}
