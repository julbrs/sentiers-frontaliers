import {
  Body,
  Container,
  Head,
  Html,
  Row,
  Column,
  Section,
  Text,
  Hr,
} from "@react-email/components";

type OrderNotificationEmailProps = {
  membershipNo: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  membershipType: "personal" | "family";
  membershipPrice: number;
  donationAmount: number;
  topoMapOrder: boolean;
  topoMapPrice: number;
  paidAt: Date;
};

const styles = {
  body: {
    backgroundColor: "#f6f6f6",
    padding: "40px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "40px",
    maxWidth: "600px",
    margin: "0 auto",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  heading: {
    fontSize: "20px",
    fontWeight: "700" as const,
    color: "#1a1a1a",
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "700" as const,
    color: "#4a5568",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "8px",
  },
  paragraph: {
    fontSize: "15px",
    color: "#333333",
    lineHeight: "1.6",
    margin: "4px 0",
  },
  labelCell: {
    fontSize: "15px",
    color: "#4a5568",
    paddingRight: "12px",
    width: "140px",
  },
  valueCell: {
    fontSize: "15px",
    color: "#1a1a1a",
    fontWeight: "500" as const,
  },
  lineItemRow: {
    borderBottom: "1px solid #e2e8f0",
    paddingTop: "8px",
    paddingBottom: "8px",
  },
  totalRow: {
    paddingTop: "12px",
  },
  totalLabel: {
    fontSize: "16px",
    fontWeight: "700" as const,
    color: "#1a1a1a",
  },
  totalAmount: {
    fontSize: "16px",
    fontWeight: "700" as const,
    color: "#276749",
  },
  footer: {
    borderTop: "1px solid #E2E8F0",
    marginTop: "24px",
    paddingTop: "24px",
    color: "#718096",
    fontSize: "14px",
  },
};

export default function OrderNotificationEmail({
  membershipNo,
  firstName,
  lastName,
  address,
  phone,
  email,
  membershipType,
  membershipPrice,
  donationAmount,
  topoMapOrder,
  topoMapPrice,
  paidAt,
}: OrderNotificationEmailProps) {
  const total = membershipPrice + donationAmount + (topoMapOrder ? topoMapPrice : 0);

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.heading}>Nouvelle adhésion #{membershipNo}</Text>

          <Text style={styles.paragraph}>
            Un paiement d&apos;adhésion a été confirmé le{" "}
            {paidAt.toLocaleDateString("fr-CA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            .
          </Text>

          <Hr style={{ margin: "20px 0" }} />

          <Text style={styles.sectionTitle}>Informations du membre</Text>
          <Section>
            <Row style={styles.lineItemRow}>
              <Column style={styles.labelCell}>Nom</Column>
              <Column style={styles.valueCell}>
                {firstName} {lastName}
              </Column>
            </Row>
            <Row style={styles.lineItemRow}>
              <Column style={styles.labelCell}>Adresse</Column>
              <Column style={styles.valueCell}>{address}</Column>
            </Row>
            <Row style={styles.lineItemRow}>
              <Column style={styles.labelCell}>Téléphone</Column>
              <Column style={styles.valueCell}>{phone}</Column>
            </Row>
            <Row style={styles.lineItemRow}>
              <Column style={styles.labelCell}>Courriel</Column>
              <Column style={styles.valueCell}>{email}</Column>
            </Row>
          </Section>

          <Hr style={{ margin: "20px 0" }} />

          <Text style={styles.sectionTitle}>Détail de la commande</Text>
          <Section>
            <Row style={styles.lineItemRow}>
              <Column style={{ ...styles.valueCell, flex: 1 }}>
                Adhésion {membershipType === "family" ? "familiale" : "personnelle"}
              </Column>
              <Column style={{ ...styles.valueCell, textAlign: "right" as const, width: "80px" }}>
                {membershipPrice.toFixed(2)} $
              </Column>
            </Row>
            {donationAmount > 0 && (
              <Row style={styles.lineItemRow}>
                <Column style={{ ...styles.valueCell, flex: 1 }}>Don</Column>
                <Column style={{ ...styles.valueCell, textAlign: "right" as const, width: "80px" }}>
                  {donationAmount.toFixed(2)} $
                </Column>
              </Row>
            )}
            {topoMapOrder && (
              <Row style={styles.lineItemRow}>
                <Column style={{ ...styles.valueCell, flex: 1 }}>
                  Carte topographique hydrofuge (livraison incluse)
                </Column>
                <Column style={{ ...styles.valueCell, textAlign: "right" as const, width: "80px" }}>
                  {topoMapPrice.toFixed(2)} $
                </Column>
              </Row>
            )}
            <Row style={styles.totalRow}>
              <Column style={{ ...styles.totalLabel, flex: 1 }}>Total</Column>
              <Column style={{ ...styles.totalAmount, textAlign: "right" as const, width: "80px" }}>
                {total.toFixed(2)} $
              </Column>
            </Row>
          </Section>

          <Section style={styles.footer}>
            <Text>
              Sentiers Frontaliers
              <br />
              finances@sentiersfrontaliers.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
