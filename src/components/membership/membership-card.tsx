import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";

export type MembershipCardPdfProps = {
  firstName: string;
  lastName: string;
  type: "personal" | "family" | "corporate";
  paidAt: Date;
  secondAdultFirstName?: string | null;
  secondAdultLastName?: string | null;
  children?: Array<{ firstName: string; lastName: string }>;
  membershipId: number;
  logoDataUri?: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flexDirection: "column",
    gap: 12,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: 700 as const,
    color: "#394830",
    textAlign: "center" as const,
    marginBottom: 10,
  },
  infoBox: {
    padding: 10,
    backgroundColor: "#F5F5F5",
    borderLeftWidth: 3,
    borderLeftColor: "#394830",
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: 700 as const,
    color: "#394830",
    marginBottom: 5,
  },
  infoText: {
    fontSize: 9,
    color: "#333333",
    lineHeight: 1.4,
  },
  cardCenteredContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryCardBlock: {
    gap: 4,
  },
  secondaryCardTitle: {
    fontSize: 10,
    fontWeight: 700 as const,
    color: "#394830",
    textAlign: "center" as const,
  },
  cutLineContainer: {
    position: "relative" as const,
    width: 265,
    height: 197,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  cutLine: {
    position: "absolute" as const,
    borderColor: "#CCCCCC",
  },
  cutLineHorizontal: {
    width: 265,
    height: 0,
    top: 11,
    borderTopWidth: 0.5,
  },
  cutLineHorizontalBottom: {
    width: 265,
    height: 0,
    top: 186,
    borderTopWidth: 0.5,
  },
  cutLineVertical: {
    width: 0,
    height: 197,
    left: 11,
    borderLeftWidth: 0.5,
  },
  cutLineVerticalRight: {
    width: 0,
    height: 197,
    left: 254,
    borderLeftWidth: 0.5,
  },
  card: {
    width: 243,
    height: 175,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#394830",
    padding: 12,
    borderRadius: 4,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    width: 74.4,
    height: 36,
  },
  membershipId: {
    fontSize: 7,
    color: "#1F5233",
    textAlign: "right" as const,
    fontWeight: 700 as const,
  },
  content: {
    flex: 1,
    marginBottom: 6,
    flexDirection: "row",
    gap: 12,
  },
  leftColumn: {
    flex: 1,
    justifyContent: "flex-start" as const,
  },
  rightColumn: {
    flex: 1,
    justifyContent: "flex-start" as const,
  },
  memberName: {
    fontSize: 12,
    color: "#1F5233",
    fontWeight: 700 as const,
    marginBottom: 2,
  },
  secondAdultName: {
    fontSize: 9,
    color: "#333333",
    marginBottom: 3,
    fontStyle: "italic" as const,
  },
  childrenLabel: {
    fontSize: 7,
    color: "#1F5233",
    fontWeight: 700 as const,
    marginBottom: 2,
  },
  childName: {
    fontSize: 8,
    color: "#333333",
    marginBottom: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end" as const,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#394830",
  },
  expiryLabel: {
    fontSize: 6,
    color: "#666666",
    fontWeight: 600 as const,
  },
  expiryDate: {
    fontSize: 9,
    color: "#1F5233",
    fontWeight: 700 as const,
    marginTop: 1,
  },
  typeLabel: {
    fontSize: 6,
    color: "#666666",
    fontWeight: 600 as const,
    textAlign: "right" as const,
  },
  typeValue: {
    fontSize: 9,
    color: "#1F5233",
    fontWeight: 700 as const,
    marginTop: 1,
    textAlign: "right" as const,
  },
});

type MembershipCardViewProps = {
  primaryFirstName: string;
  primaryLastName: string;
  secondaryFirstName?: string | null;
  secondaryLastName?: string | null;
  children?: Array<{ firstName: string; lastName: string }>;
  membershipId: number;
  logoDataUri?: string;
  expiryDate: Date;
  typeLabel: string;
};

const MembershipCardView = ({
  primaryFirstName,
  primaryLastName,
  secondaryFirstName,
  secondaryLastName,
  children,
  membershipId,
  logoDataUri,
  expiryDate,
  typeLabel,
}: MembershipCardViewProps) => {
  return (
    <View style={styles.cardCenteredContainer}>
      <View style={styles.cutLineContainer}>
        <View style={[styles.cutLine, styles.cutLineHorizontal]} />
        <View style={[styles.cutLine, styles.cutLineHorizontalBottom]} />
        <View style={[styles.cutLine, styles.cutLineVertical]} />
        <View style={[styles.cutLine, styles.cutLineVerticalRight]} />

        <View style={styles.card}>
          <View style={styles.header}>
            {logoDataUri && <Image style={styles.logo} src={logoDataUri} />}
            <Text style={styles.membershipId}>#{String(membershipId).padStart(6, "0")}</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.leftColumn}>
              <Text style={styles.memberName}>{`${primaryFirstName} ${primaryLastName}`}</Text>
              {secondaryFirstName && secondaryLastName && (
                <Text
                  style={styles.secondAdultName}
                >{`${secondaryFirstName} ${secondaryLastName}`}</Text>
              )}
            </View>

            {children && children.length > 0 && (
              <View style={styles.rightColumn}>
                <Text style={styles.childrenLabel}>Enfants:</Text>
                {children.map((child, idx) => (
                  <Text key={idx} style={styles.childName}>
                    {`${child.firstName} ${child.lastName}`}
                  </Text>
                ))}
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <View>
              <Text style={styles.expiryLabel}>VALIDE JUSQU'AU</Text>
              <Text style={styles.expiryDate}>{expiryDate.toLocaleDateString("fr-CA")}</Text>
            </View>
            <View>
              <Text style={styles.typeLabel}>TYPE</Text>
              <Text style={styles.typeValue}>{typeLabel}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export const MembershipCardPdf = ({
  firstName,
  lastName,
  type,
  paidAt,
  secondAdultFirstName,
  secondAdultLastName,
  children,
  membershipId,
  logoDataUri,
}: MembershipCardPdfProps) => {
  // Calculate expiry date (1 year from paid date)
  const expiryDate = new Date(paidAt);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const typeLabel =
    type === "family" ? "Famille" : type === "corporate" ? "Corporatif" : "Individuel";

  return (
    <Document title="Carte de membre Sentiers Frontaliers">
      <Page size="LETTER" style={styles.page}>
        <View style={styles.container}>
          <Text style={styles.documentTitle}>Carte de membre Sentiers Frontaliers</Text>

          {/* Info box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Utilisation numérique</Text>
            <Text style={styles.infoText}>
              Vous pouvez présenter cette carte en format PDF sur votre téléphone à la ZEC ainsi que
              chez nos enseignes partenaires pour profiter des avantages liés à votre adhésion.
            </Text>
            <Text style={[styles.infoTitle, { marginTop: 8 }]}>Impression optionnelle</Text>
            <Text style={styles.infoText}>
              Si vous souhaitez une version physique, imprimez cette page, découpez la carte en
              suivant les repères de coupe, puis plastifiez-la au besoin.
            </Text>
          </View>

          <MembershipCardView
            primaryFirstName={firstName}
            primaryLastName={lastName}
            secondaryFirstName={secondAdultFirstName}
            secondaryLastName={secondAdultLastName}
            children={children}
            membershipId={membershipId}
            logoDataUri={logoDataUri}
            expiryDate={expiryDate}
            typeLabel={typeLabel}
          />

          {type === "family" && secondAdultFirstName && secondAdultLastName && (
            <View style={styles.secondaryCardBlock}>
              <Text style={styles.secondaryCardTitle}>Carte du second adulte</Text>
              <MembershipCardView
                primaryFirstName={secondAdultFirstName}
                primaryLastName={secondAdultLastName}
                secondaryFirstName={firstName}
                secondaryLastName={lastName}
                children={children}
                membershipId={membershipId}
                logoDataUri={logoDataUri}
                expiryDate={expiryDate}
                typeLabel={typeLabel}
              />
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
