import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { PixelButton } from './PixelButton';

interface PixelEmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function PixelEmptyState({
    title = 'Belum Ada Data',
    description = 'Data laporan sampah belum tersedia saat ini.',
    actionLabel,
    onAction,
}: PixelEmptyStateProps) {
    const cleanTitle = title.replace(/[\[\]]/g, '').trim();

    return (
        <View style={styles.container}>
            <View style={styles.iconBox}>
                <Feather name="file-text" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{cleanTitle}</Text>
            <Text style={styles.description}>{description}</Text>
            {actionLabel && onAction && (
                <View style={styles.actionWrap}>
                    <PixelButton
                        title={actionLabel.replace(/[\[\]]/g, '').trim()}
                        onPress={onAction}
                        variant="primary"
                        size="sm"
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginVertical: 4,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    iconBox: {
        width: 40,
        height: 40,
        backgroundColor: '#DCFCE7',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 3,
    },
    description: {
        fontSize: 12,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 16,
    },
    actionWrap: {
        marginTop: 10,
        width: 150,
    },
});
