import { BodyText, Caption, Heading3 } from '@/components/CustomText';
import { type Materiel } from '@/services/materielsApi';
import { AlertTriangle, Calendar, Edit, Eye, Package, PackageOpen, User } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

interface MaterielListProps {
  materiels: Materiel[];
  onMaterielPress?: (materiel: Materiel) => void;
  onMaterielEdit?: (materiel: Materiel) => void;
  variant?: 'compact' | 'detailed';
}

export function MaterielList({ 
  materiels, 
  onMaterielPress, 
  onMaterielEdit,
  variant = 'detailed' 
}: MaterielListProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const getEtatColor = (etat: string) => {
    switch (etat?.toLowerCase()) {
      case 'neuf':
      case 'excellent':
        return '#10b981';
      case 'bon':
      case 'moyen':
        return '#f59e0b';
      case 'mauvais':
      case 'défectueux':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

    if (variant === 'compact') {
    return (
      <View style={styles.container}>
        {materiels.map((materiel) => (
          <Pressable
            key={materiel.id}
            style={styles.compactItem}
            onPress={() => onMaterielPress?.(materiel)}
          >
            <View style={styles.compactHeader}>
              <Package size={16} color="#1f2937" />
              <Heading3 style={styles.compactTitle}>{materiel.nom}</Heading3>
            </View>
            <Caption style={styles.compactSubtitle}>
              {materiel.reference || 'Sans référence'} • {materiel.type_materiel}
            </Caption>
            {materiel.is_obsolete && (
              <View style={styles.obsoleteBadge}>
                <AlertTriangle size={12} color="#ef4444" />
                <Caption style={styles.obsoleteText}>Obsolète</Caption>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {materiels.map((materiel) => (
        <View key={materiel.id} style={styles.item}>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <View style={styles.titleRow}>
                <Package size={20} color="#1f2937" />
                <Heading3 style={styles.title}>{materiel.nom}</Heading3>
              </View>
              <BodyText style={styles.reference}>Réf: {materiel.reference || 'Sans référence'}</BodyText>
              <BodyText style={styles.type}>Type: {materiel.type_materiel}</BodyText>
              <View style={styles.badgesRow}>
                {materiel.etat && (
                  <View style={[styles.etatBadge, { backgroundColor: getEtatColor(materiel.etat) + '20' }]}>
                    <BodyText style={[styles.etatText, { color: getEtatColor(materiel.etat) }]}>{materiel.etat}</BodyText>
                  </View>
                )}
                {materiel.is_obsolete && (
                  <View style={styles.obsoleteBadge}>
                    <AlertTriangle size={12} color="#ef4444" />
                    <BodyText style={styles.obsoleteText}>Obsolète</BodyText>
                  </View>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.itemDetails}>
            <View style={styles.detailRow}>
              <PackageOpen size={16} color="#666" />
              <BodyText style={styles.detailLabel}>
              Quantité: {materiel.quantite_total}
              </BodyText>
            </View>
            <View style={styles.detailRow}>
              <Calendar size={16} color="#666" />
              <BodyText style={styles.detailLabel}>
              Date d&apos;achat: {formatDate(materiel.date_achat)}
              </BodyText>
            </View>
            {materiel.client && (
              <View style={styles.detailRow}>
                <User size={16} color="#666" />
                <BodyText style={styles.detailLabel}>
                  Client: {materiel.client}
                </BodyText>
              </View>
            )}
          </View>

          {/* Boutons d'action en bas */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onMaterielPress?.(materiel)}
            >
              <Eye size={24} color="#3D9FCD" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onMaterielEdit?.(materiel)}
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
  reference: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 2,
  },
  type: {
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
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  etatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  etatText: {
    fontSize: 12,
    fontWeight: '600',
  },
  obsoleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#ef444420',
    alignSelf: 'flex-start',
  },
  obsoleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
});
