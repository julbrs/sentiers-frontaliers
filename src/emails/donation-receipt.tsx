import { Html, Head, Body, Container, Section, Text } from "@react-email/components";

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

type TaxReceiptEmailProps = {
  seasonName: string;
};

export default function TaxReceiptEmail({ seasonName }: TaxReceiptEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.paragraph}>Bonjour,</Text>

          <Text style={styles.paragraph}>
            Voici en pièce jointe votre reçu de don pour Sentiers Frontaliers pour la saison{" "}
            {seasonName}. Nous vous remercions sincèrement pour votre appui!
          </Text>

          <Text style={styles.paragraph}>En espérant le tout conforme.</Text>

          <Text style={styles.paragraph}>
            Si jamais il y avait une erreur, merci de me le signaler rapidement pour que je fasse la
            correction.
          </Text>

          <Text style={styles.paragraph}>Bonne journée et au plaisir!</Text>

          <Section style={styles.footer}>
            <Text>
              Julien Bras
              <br />
              Finances Sentiers Frontaliers
              <br />
              finances@sentiersfrontaliers.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
