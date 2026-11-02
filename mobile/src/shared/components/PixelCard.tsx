import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';

interface PixelCardProps {
    title?: string;
    required?: boolean;
    subtitle?: string;
    badgeText?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    style?: ViewStyle;
    contentStyle?: ViewStyle;
    titleStyle?: TextStyle;
}

export function PixelCard({
    title,
    required = false,
    subtitle,
    badgeText,
    action,
    children,
    style,
    contentStyle,
    titleStyle,
}: PixelCardProps) {
    return (
        <View style={[styles.card, style]}>
            {(title || badgeText || action) && (
                <View style={styles.header}>
                    <View style={styles.titleArea}>
                        {badgeText && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{badgeText.replace(/[\[\]]/g, '')}</Text>
                            </View>
                        )}
                        {title && (
                            <Text style={[styles.title, titleStyle]}>
                                {title.replace(/[\[\]]/g, '')}
                                {required && <Text style={styles.requiredStar}> *</Text>}
                            </Text>
                        )}
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                    {action && <View style={styles.actionArea}>{action}</View>}
                </View>
            )}
            <View style={[styles.content, contentStyle]}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 16,
        marginBottom: 14,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingBottom: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    titleArea: {
        flex: 1,
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: '#DCFCE7',
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 2.5,
        marginBottom: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#15803D',
        letterSpacing: 0.2,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: 0.1,
    },
    requiredStar: {
        color: '#E11D48',
        fontWeight: '700',
        fontSize: 14,
    },
    subtitle: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    actionArea: {
        marginLeft: 8,
    },
    content: {},
});
