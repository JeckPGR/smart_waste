import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { Colors } from '../theme/colors';

interface PixelButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'pixel';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function PixelButton({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    style,
    textStyle,
}: PixelButtonProps) {
    const getBgColor = () => {
        if (disabled) return '#E2E8F0';
        switch (variant) {
            case 'primary':
                return Colors.primary;
            case 'secondary':
                return '#F1F5F9';
            case 'danger':
                return '#E11D48';
            case 'pixel':
                return '#0F172A';
            case 'outline':
                return '#FFFFFF';
            default:
                return Colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return '#94A3B8';
        switch (variant) {
            case 'primary':
            case 'danger':
            case 'pixel':
                return '#FFFFFF';
            case 'secondary':
                return '#0F172A';
            case 'outline':
                return '#0F172A';
            default:
                return '#FFFFFF';
        }
    };

    const getHeight = () => {
        switch (size) {
            case 'sm':
                return 36;
            case 'lg':
                return 50;
            case 'md':
            default:
                return 44;
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'sm':
                return 12;
            case 'lg':
                return 15;
            case 'md':
            default:
                return 13;
        }
    };

    const isOutline = variant === 'outline';

    return (
        <TouchableOpacity
            activeOpacity={0.82}
            disabled={disabled || loading}
            onPress={onPress}
            style={[
                styles.button,
                {
                    height: getHeight(),
                    backgroundColor: getBgColor(),
                    borderWidth: isOutline ? 1.5 : 0,
                    borderColor: isOutline ? '#CBD5E1' : 'transparent',
                },
                variant === 'primary' && !disabled && styles.primaryShadow,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator size="small" color={getTextColor()} />
            ) : (
                <View style={styles.content}>
                    {icon && <View style={styles.iconWrap}>{icon}</View>}
                    <Text
                        style={[
                            styles.text,
                            {
                                color: getTextColor(),
                                fontSize: getFontSize(),
                            },
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    primaryShadow: {
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrap: {
        marginRight: 8,
    },
    text: {
        fontWeight: '700',
        letterSpacing: 0.2,
    },
});
