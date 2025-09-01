import { BodyText, Heading3 } from "@/components/CustomText";
import { Email } from "@/services/servicesWebApi";
import { useRouter } from "expo-router";
import { Calendar, Edit, Eye, FileText, Mail, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface EmailsListProps {
  emails: Email[];
  loading?: boolean;
  onItemPress?: (email: Email) => void;
  onEditPress?: (email: Email) => void;
  onDeletePress?: (email: Email) => void;
}

export const EmailsList: React.FC<EmailsListProps> = ({
  emails,
  loading = false,
  onItemPress,
  onEditPress,
  onDeletePress,
}) => {
  const router = useRouter();

  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <BodyText style={styles.loadingText}>Chargement des emails...</BodyText>
      </View>
    );
  }

  if (emails.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <BodyText style={styles.emptyText}>Aucun email trouvé</BodyText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {emails.map((email) => (
                  <TouchableOpacity
            key={email.id}
            style={styles.card}
            onPress={() => onItemPress?.(email)}
            activeOpacity={0.7}
          >
          <View style={styles.header}>
            <Heading3 style={styles.title}>{email.adresse_email}</Heading3>
          </View>

          <View style={styles.info}>
            <View style={styles.infoRow}>
              <User size={16} color="#666" />
              <BodyText style={styles.infoText}>{email.client_nom}</BodyText>
            </View>
            
            <View style={styles.infoRow}>
              <Mail size={16} color="#666" />
              <BodyText style={styles.infoText}>{email.type_email}</BodyText>
            </View>
            
            {email.date_renouvellement && (
              <View style={styles.infoRow}>
                <Calendar size={16} color="#666" />
                <BodyText style={styles.infoText}>
                  Renouvellement: {email.date_renouvellement}
                </BodyText>
              </View>
            )}

            {email.date_renouvellement && (
              <View style={styles.infoRow}>
                <FileText size={16} color="#666" />
                <BodyText style={styles.infoText}>
                  Dernière facture: {email.derniere_facture}
                </BodyText>
              </View>
            )}
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onItemPress(email)}
            >
              <Eye size={24} color="#3D9FCD" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push(`/email-edit?id=${email.id}`)}
            >
              <Edit size={24} color="#FBCA35" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  info: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
});
