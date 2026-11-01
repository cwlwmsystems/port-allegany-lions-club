import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 54,
    paddingHorizontal: 64,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.55,
    color: '#222222',
  },

  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 18,
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#d4d4d4',
  },

  logo: {
    width: 58,
    height: 58,
    objectFit: 'contain',
    marginRight: 18,
  },

  clubName: {
    fontSize: 17,
    fontFamily: 'Helvetica-Bold',
  },

  clubSubtitle: {
    marginTop: 4,
    color: '#666666',
    fontSize: 9,
  },

  date: {
    marginBottom: 24,
  },

  recipient: {
    marginBottom: 28,
  },

  recipientName: {
    fontFamily: 'Helvetica-Bold',
  },

  body: {
    whiteSpace: 'pre-wrap',
  },

  footer: {
    position: 'absolute',
    left: 64,
    right: 64,
    bottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#e3e3e3',
    paddingTop: 8,
    fontSize: 8,
    color: '#777777',
    textAlign: 'center',
  },
});

type Props = {
  recipientName?: string | null;
  addressLines?: string[];
  body: string;
  date: string;
  logoPath: string;
};

export default function LetterPdf({
  recipientName,
  addressLines = [],
  body,
  date,
  logoPath,
}: Props) {
  return (
    <Document>
      <Page
        size="LETTER"
        style={styles.page}
      >
        <View style={styles.header}>
          <Image
            src={logoPath}
            style={styles.logo}
          />

          <View>
            <Text style={styles.clubName}>
              Port Allegany Lions Club
            </Text>

            <Text style={styles.clubSubtitle}>
              Rooted in Community. Driven by Service.
            </Text>
          </View>
        </View>

        <Text style={styles.date}>
          {date}
        </Text>

        {(recipientName ||
          addressLines.length > 0) && (
          <View style={styles.recipient}>
            {recipientName && (
              <Text
                style={
                  styles.recipientName
                }
              >
                {recipientName}
              </Text>
            )}

            {addressLines.map(
              (line, index) => (
                <Text key={index}>
                  {line}
                </Text>
              )
            )}
          </View>
        )}

        <Text style={styles.body}>
          {body}
        </Text>

        <Text style={styles.footer}>
          Port Allegany Lions Club •
          Port Allegany, Pennsylvania
        </Text>
      </Page>
    </Document>
  );
}
