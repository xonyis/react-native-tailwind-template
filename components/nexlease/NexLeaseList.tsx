import { BodyText, Caption, Heading3 } from '@/components/CustomText';
import { type NexLease } from '@/services/nexleaseApi';
import { Calendar, Edit, Eye, FileText } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

interface NexLeaseListProps {
  nexleases: NexLease[];
  onNexLeasePress?: (nexlease: NexLease) => void;
  onNexLeaseEdit?: (nexlease: NexLease) => void;
  variant?: 'compact' | 'detailed';
}

export function NexLeaseList({ 
  nexleases, 
  onNexLeasePress, 
  onNexLeaseEdit,
  variant = 'detailed' 
}: NexLeaseListProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non définie';
    return dateString; // Les dates sont déjà formatées d/m/Y depuis l'API
  };

  if (variant === 'compact') {
    return (
      <View style={styles.container}>
        {nexleases.map((nexlease) => (
          <Pressable
            key={nexlease.id}
            style={styles.compactItem}
            onPress={() => onNexLeasePress?.(nexlease)}
          >
            <View style={styles.compactHeader}>
              <FileText size={16} color="#1f2937" />
              <Heading3 style={styles.compactTitle}>{nexlease.client.nom}</Heading3>
            </View>
            <Caption style={styles.compactSubtitle}>
              {nexlease.duree} • {formatDate(nexlease.dateDebut)} - {formatDate(nexlease.dateFin)}
            </Caption>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {nexleases.map((nexlease) => (
        <View key={nexlease.id} style={styles.item}>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <View style={styles.titleRow}>
                <FileText size={20} color="#1f2937" />
                <Heading3 style={styles.title}>{nexlease.client.nom}</Heading3>
              </View>
              <BodyText style={styles.duree}>Durée: {nexlease.duree}</BodyText>
            </View>
          </View>
          
          <View style={styles.itemDetails}>
            <View style={styles.detailRow}>
              <Calendar size={16} color="#666" />
              <BodyText style={styles.detailLabel}>
                Début: {formatDate(nexlease.dateDebut)}
              </BodyText>
            </View>
            <View style={styles.detailRow}>
              <Calendar size={16} color="#666" />
              <BodyText style={styles.detailLabel}>
                Fin: {formatDate(nexlease.dateFin)}
              </BodyText>
            </View>
            {nexlease.biensFinances && (
              <View style={styles.detailRow}>
                <FileText size={16} color="#666" />
                <BodyText style={styles.detailLabel}>
                  Biens financés: {nexlease.biensFinances}
                </BodyText>
              </View>
            )}
          </View>

          {/* Boutons d'action en bas */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onNexLeasePress?.(nexlease)}
            >
              <Eye size={24} color="#3D9FCD" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onNexLeaseEdit?.(nexlease)}
            >
              <Edit size={24} color="#FBCA35" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    marginLeft: 8,
    color: '#1f2937',
  },
  duree: {
    color: '#6b7280',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
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
  itemDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  detailValue: {
    color: '#1f2937',
    fontWeight: '500',
  },
  compactItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  compactTitle: {
    marginLeft: 8,
    color: '#1f2937',
    fontSize: 16,
  },
  compactSubtitle: {
    color: '#6b7280',
    marginLeft: 24,
  },
});
