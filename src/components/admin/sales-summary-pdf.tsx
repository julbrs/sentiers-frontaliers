import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { type CloverSalesSummary } from "@/lib/sales-summary";

type SalesSummaryPdfProps = {
  summary: CloverSalesSummary;
};

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 22,
    marginBottom: 6,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  period: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    paddingVertical: 6,
    fontWeight: "bold",
    backgroundColor: "#f4e2d6",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#d8d8d8",
  },
  boldRow: {
    fontWeight: "bold",
  },
  sectionGap: {
    marginTop: 14,
  },
  colAccount: { width: "13%" },
  colProject: { width: "8%" },
  colTitle: { width: "24%" },
  colPrice: { width: "12%", textAlign: "right" },
  colQtySold: { width: "11%", textAlign: "right" },
  colQtyRefunded: { width: "11%", textAlign: "right" },
  colTotalSold: { width: "11%", textAlign: "right" },
  colTotalRefunded: { width: "10%", textAlign: "right" },
  colAccounting: { width: "12%", textAlign: "right" },
});

const currency = new Intl.NumberFormat("fr-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(value: number) {
  return currency.format(value);
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export const SalesSummaryPdf = ({ summary }: SalesSummaryPdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Sentiers Frontaliers</Text>
      <Text style={styles.subtitle}>Sommaire des ventes en ligne via Clover</Text>
      <Text style={styles.period}>
        Période: {formatDate(summary.startDate)} au {formatDate(summary.endDate)}
      </Text>

      <View style={styles.tableHeader}>
        <Text style={styles.colAccount}>Compte</Text>
        <Text style={styles.colProject}>Projet</Text>
        <Text style={styles.colTitle}>Produits</Text>
        <Text style={styles.colPrice}>Prix</Text>
        <Text style={styles.colQtySold}>Qt. vendues</Text>
        <Text style={styles.colQtyRefunded}>Qt. remb.</Text>
        <Text style={styles.colTotalSold}>Total vendu</Text>
        <Text style={styles.colTotalRefunded}>Total remb.</Text>
        <Text style={styles.colAccounting}>Total compta</Text>
      </View>

      {summary.productLines.map((line) => (
        <View style={styles.row} key={line.accountNumber}>
          <Text style={styles.colAccount}>{line.accountNumber}</Text>
          <Text style={styles.colProject}>{summary.projectCode}</Text>
          <Text style={styles.colTitle}>{line.title}</Text>
          <Text style={styles.colPrice}>
            {line.unitPrice == null ? "-" : formatMoney(line.unitPrice)}
          </Text>
          <Text style={styles.colQtySold}>{line.quantitySold}</Text>
          <Text style={styles.colQtyRefunded}>{line.quantityRefunded || "-"}</Text>
          <Text style={styles.colTotalSold}>{formatMoney(line.totalSold)}</Text>
          <Text style={styles.colTotalRefunded}>{formatMoney(line.totalRefunded)}</Text>
          <Text style={styles.colAccounting}>{formatMoney(line.totalForAccounting)}</Text>
        </View>
      ))}

      <View style={[styles.row, styles.boldRow]}>
        <Text style={styles.colAccount} />
        <Text style={styles.colProject} />
        <Text style={styles.colTitle}>Total des produits</Text>
        <Text style={styles.colPrice} />
        <Text style={styles.colQtySold} />
        <Text style={styles.colQtyRefunded} />
        <Text style={styles.colTotalSold}>{formatMoney(summary.productsSoldTotal)}</Text>
        <Text style={styles.colTotalRefunded}>{formatMoney(summary.productsRefundedTotal)}</Text>
        <Text style={styles.colAccounting}>{formatMoney(summary.productsAccountingTotal)}</Text>
      </View>

      {summary.fees.length > 0 && (
        <View style={styles.sectionGap}>
          {summary.fees.map((fee, index) => (
            <View style={styles.row} key={`${fee.accountNumber}-${index}`}>
              <Text style={styles.colAccount}>{fee.accountNumber}</Text>
              <Text style={styles.colProject}>{summary.projectCode}</Text>
              <Text style={styles.colTitle}>{fee.title}</Text>
              <Text style={styles.colPrice} />
              <Text style={styles.colQtySold} />
              <Text style={styles.colQtyRefunded} />
              <Text style={styles.colTotalSold} />
              <Text style={styles.colTotalRefunded} />
              <Text style={styles.colAccounting}>{formatMoney(fee.amount)}</Text>
            </View>
          ))}
        </View>
      )}

      {summary.revenues.length > 0 && (
        <View style={styles.sectionGap}>
          {summary.revenues.map((revenue, index) => (
            <View style={styles.row} key={`${revenue.accountNumber}-${index}`}>
              <Text style={styles.colAccount}>{revenue.accountNumber}</Text>
              <Text style={styles.colProject}>{summary.projectCode}</Text>
              <Text style={styles.colTitle}>{revenue.title}</Text>
              <Text style={styles.colPrice} />
              <Text style={styles.colQtySold} />
              <Text style={styles.colQtyRefunded} />
              <Text style={styles.colTotalSold} />
              <Text style={styles.colTotalRefunded} />
              <Text style={styles.colAccounting}>{formatMoney(revenue.amount)}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.row, styles.boldRow, styles.sectionGap]}>
        <Text style={styles.colAccount}>1010</Text>
        <Text style={styles.colProject}>{summary.projectCode}</Text>
        <Text style={styles.colTitle}>Balance versée sur le compte bancaire</Text>
        <Text style={styles.colPrice} />
        <Text style={styles.colQtySold} />
        <Text style={styles.colQtyRefunded} />
        <Text style={styles.colTotalSold} />
        <Text style={styles.colTotalRefunded} />
        <Text style={styles.colAccounting}>{formatMoney(summary.bankBalanceTotal)}</Text>
      </View>
    </Page>
  </Document>
);
