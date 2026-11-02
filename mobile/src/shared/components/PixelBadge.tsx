import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';

export type BadgeType =
    | 'PENDING'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'REJECTED'
    | 'ORGANIC'
    | 'PLASTIC'
    | 'PAPER'
    | 'XP'
    | 'CUSTOM';

interface PixelBadgeProps {
    type?: BadgeType;
    label?: string;
    style?: ViewStyle;
    textStyle?: TextStyle;
    showDot?: boolean;
}

export function PixelBadge({
    type = 'CUSTOM',
    label,
    style,
    textStyle,
    showDot = true,
}: PixelBadgeProps) {
    const getBadgeConfig = () => {
        switch (type) {
            case 'PENDING':
                return {
                    bg: '#FEF3C7',
                    border: '#FDE68A',
                    text: '#92400E',
                    dot: '#D97706',
                    defaultLabel: 'Menunggu',
                };
            case 'IN_PROGRESS':
                return {
                    bg: '#E0F2FE',
                    border: '#BAE6FD',
                    text: '#0369A1',
                    dot: '#0284C7',
                    defaultLabel: 'Diproses',
                };
            case 'COMPLETED':
                return {
                    bg: '#DCFCE7',
                    border: '#BBF7D0',
                    text: '#15803D',
                    dot: '#16A34A',
                    defaultLabel: 'Selesai',
                };
            case 'REJECTED':
                return {
                    bg: '#FFE4E6',
                    border: '#FECDD3',
                    text: '#BE123C',
                    dot: '#E11D48',
                    defaultLabel: 'Ditolak',
                };
            case 'ORGANIC':
                return {
                    bg: '#DCFCE7',
                    border: '#BBF7D0',
                    text: '#15803D',
                    dot: '#16A34A',
                    defaultLabel: 'Organik',
                };
            case 'PLASTIC':
                return {
                    bg: '#E0F2FE',
                    border: '#BAE6FD',
                    text: '#0369A1',
                    dot: '#0284C7',
                    defaultLabel: 'Plastik',
                };
            case 'PAPER':
                return {
                    bg: '#FEF3C7',
                    border: '#FDE68A',
                    text: '#B45309',
                    dot: '#D97706',
                    defaultLabel: 'Kertas',
                };
            case 'XP':
                return {
                    bg: '#FEF08A',
                    border: '#FDE047',
                    text: '#854D0E',
                    dot: '#CA8A04',
                    defaultLabel: '+50 XP',
                };
            default:
                return {
                    bg: '#F1F5F9',
                    border: '#E2E8F0',
                    text: Colors.textPrimary,
                    dot: '#64748B',
                    defaultLabel: label ? label.replace(/[\[\]]/g, '') : 'Tag',
                };
        }
    };

    const config = getBadgeConfig();
    const cleanLabel = (label || config.defaultLabel).replace(/[\[\]]/g, '').trim();

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: config.bg,
                    borderColor: config.border,
                },
                style,
            ]}
        >
            {showDot && (
                <View
                    style={[
                        styles.dot,
                        { backgroundColor: config.dot },
                    ]}
                />
            )}
            <Text
                style={[
                    styles.text,
                    { color: config.text },
                    textStyle,
                ]}
            >
                {cleanLabel}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3.5,
        borderRadius: 20,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 5,
    },
    text: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.1,
    },
});
