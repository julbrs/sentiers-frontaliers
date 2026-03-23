import { Body, Container, Head, Html, Section, Text } from "@react-email/components";

type MembershipCardEmailProps = {
  firstName: string;
  lastName: string;
  membershipType: "personal" | "family";
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
  paragraph: {
    fontSize: "16px",
    color: "#333333",
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  footer: {
    borderTop: "1px solid #E2E8F0",
    marginTop: "24px",
    paddingTop: "24px",
    color: "#718096",
    fontSize: "14px",
  },
};

export default function MembershipCardEmail({
  firstName,
  lastName,
  membershipType,
  paidAt,
}: MembershipCardEmailProps) {
  const endDate = new Date(paidAt);
  endDate.setFullYear(endDate.getFullYear() + 1);

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.paragraph}>
            Bonjour {firstName} {lastName},
          </Text>

          <Text style={styles.paragraph}>
            Votre paiement d&apos;adhésion a été confirmé. Vous trouverez votre carte de membre en
            pièce jointe.
          </Text>

          <Text style={styles.paragraph}>
            Type d&apos;adhésion: {membershipType === "family" ? "Familiale" : "Personnelle"}
            <br />
            Date de début: {paidAt.toLocaleDateString("fr-CA")}
            <br />
            Date de fin: {endDate.toLocaleDateString("fr-CA")}
          </Text>

          <Text style={styles.paragraph}>
            Conservez ce document sur votre téléphone ou imprimez-le au besoin.
          </Text>

          <Section style={styles.footer}>
            <Text>
              Sentiers Frontaliers
              <br />
              info@sentiersfrontaliers.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
