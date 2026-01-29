import { Document, Page, StyleSheet, Text, View, Image, Font } from "@react-pdf/renderer";

export type DonationReceiptPdfProps = {
  donorFirstName: string;
  donorLastName: string;
  address: string | null;
  amount: number;
  date: string;
  seasonName: string;
  donationId: number;
};

Font.register({
  family: "Shadows Into Light",
  src: "http://fonts.gstatic.com/s/shadowsintolight/v6/clhLqOv7MXn459PTh0gXYBayoCksK7A5ZWkzVNukUdQ.ttf",
});

const styles = StyleSheet.create({
  page: { padding: 24 },
  copyBox: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 12,
    marginBottom: 12,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  org: { flexDirection: "column", gap: 6, alignItems: "flex-start" },
  headerRight: { alignItems: "flex-end", gap: 6, minWidth: 190 },
  logo: { width: 103, height: 30 },
  orgTexts: { fontSize: 10, lineHeight: 1.3 },
  bigHeader: { fontSize: 11, textAlign: "center", marginBottom: 6, fontWeight: 700 },
  rightTag: {
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 10,
  },
  signatureText: {
    fontFamily: "Shadows Into Light",
  },
  row: { flexDirection: "row", marginTop: 6, gap: 8 },
  colLeft: { width: "65%" },
  colRight: { width: "35%", alignItems: "flex-end" },
  label: { fontSize: 10 },
  valueLine: { paddingBottom: 2, fontSize: 10 },
  boxedValue: {
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: 700,
    minWidth: 100,
    textAlign: "center",
  },
  twoCols: { flexDirection: "row", gap: 8, marginTop: 6 },
  col: { flex: 1 },
  footNote: { marginTop: 8, fontSize: 8, textAlign: "center" },
  copyLabel: { marginTop: 6, fontSize: 9 },
});

const DonorBlock = ({
  donorFirstName,
  donorLastName,
  address,
}: Pick<DonationReceiptPdfProps, "donorFirstName" | "donorLastName" | "address">) => (
  <View>
    <Text style={[styles.label, { fontWeight: 700 }]}>Donateur:</Text>
    <Text style={styles.valueLine}>
      {donorFirstName} {donorLastName}
    </Text>
    {address ? <Text style={styles.valueLine}>{address}</Text> : null}
  </View>
);

const OrgBlock = () => (
  <View style={styles.org}>
    <Image style={styles.logo} src="/logo.png" />
    <View>
      <Text style={styles.orgTexts}>SENTIERS FRONTALIERS INC</Text>
      <Text style={styles.orgTexts}>Case postale 23</Text>
      <Text style={styles.orgTexts}>Lac-Mégantic (Québec) G6B 2S5</Text>
    </View>
  </View>
);

const ReceiptCopy = ({
  copyLabel,
  donorFirstName,
  donorLastName,
  address,
  amountFmt,
  issuanceDate,
  receiptNo,
  seasonName,
}: {
  copyLabel: string;
  donorFirstName: string;
  donorLastName: string;
  address: string | null;
  amountFmt: string;
  year: number;
  issuanceDate: Date;
  receiptNo: string;
  seasonName: string;
}) => (
  <View style={styles.copyBox}>
    <Text style={styles.bigHeader}>REÇU OFFICIEL DE DON AUX FINS DE L'IMPÔT SUR LE REVENU</Text>

    <View style={styles.headerRow}>
      <OrgBlock />
      <View style={styles.headerRight}>
        <Text style={styles.rightTag}>Reçu no: {receiptNo}</Text>
        <DonorBlock
          donorFirstName={donorFirstName}
          donorLastName={donorLastName}
          address={address}
        />
      </View>
    </View>

    <View style={styles.twoCols}>
      <View style={styles.col}>
        <Text style={[styles.label, { fontWeight: 700 }]}>No de Charité: 141824243 RR 0001</Text>
      </View>
      <View style={[styles.col, { alignItems: "flex-end", justifyContent: "flex-end" }]}>
        <Text style={[styles.label, { marginTop: 2 }]}>
          Année de réception du don: <Text style={{ fontWeight: 700 }}>{seasonName}</Text>
        </Text>
        <Text style={styles.label}>
          Montant admissible: <Text style={{ fontWeight: 700 }}>{amountFmt}</Text>
        </Text>
      </View>
    </View>

    <View style={styles.twoCols}>
      <View style={styles.col}>
        <Text style={styles.label}>Signature autorisée : Trésorier</Text>
        <Text style={styles.signatureText}>Julien Bras</Text>
      </View>
      <View style={[styles.col, { alignItems: "flex-end", justifyContent: "flex-end" }]}>
        <Text style={styles.label}>
          Date de délivrance:{" "}
          <Text style={{ fontWeight: 700 }}>{issuanceDate.toLocaleDateString("fr-CA")}</Text>
        </Text>
        <Text style={styles.label}>
          Lieu de délivrance: <Text style={{ fontWeight: 700 }}>Lac-Mégantic</Text>
        </Text>
      </View>
    </View>

    <Text style={styles.footNote}>
      Pour des renseignements sur les organismes de bienfaisance enregistrés du Canada vous pouvez
      visiter www.cra-arc.gc.ca/bienfaisance
    </Text>

    <Text style={styles.copyLabel}>{copyLabel}</Text>
  </View>
);

export const DonationReceiptPdf = ({
  donorFirstName,
  donorLastName,
  address,
  amount,
  date,
  seasonName,
  donationId,
}: DonationReceiptPdfProps) => {
  const issuanceDate = new Date();
  const donationDate = new Date(date);
  const year = donationDate.getFullYear();
  const receiptNo = `${year}-${String(donationId).padStart(2, "0")}`;
  const amountFmt = new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(amount);

  return (
    <Document>
      <Page style={styles.page}>
        <ReceiptCopy
          copyLabel="COPIE DONATEUR"
          donorFirstName={donorFirstName}
          donorLastName={donorLastName}
          address={address}
          amountFmt={amountFmt}
          year={year}
          issuanceDate={issuanceDate}
          receiptNo={receiptNo}
          seasonName={seasonName}
        />
        <ReceiptCopy
          copyLabel="COPIE FÉDÉRALE"
          donorFirstName={donorFirstName}
          donorLastName={donorLastName}
          address={address}
          amountFmt={amountFmt}
          year={year}
          issuanceDate={issuanceDate}
          receiptNo={receiptNo}
          seasonName={seasonName}
        />
        <ReceiptCopy
          copyLabel="COPIE PROVINCIALE"
          donorFirstName={donorFirstName}
          donorLastName={donorLastName}
          address={address}
          amountFmt={amountFmt}
          year={year}
          issuanceDate={issuanceDate}
          receiptNo={receiptNo}
          seasonName={seasonName}
        />
      </Page>
    </Document>
  );
};
