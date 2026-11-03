import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface PixelInputProps extends TextInputProps {
    label?: string;
    required?: boolean;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
    containerStyle?: ViewStyle;
    wrapperStyle?: ViewStyle;
}

export function PixelInput({
    label,
    required = false,
    error,
    hint,
    icon,
    containerStyle,
    wrapperStyle,
    style,
    multiline,
    secureTextEntry,
    ...props
}: PixelInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordField = Boolean(secureTextEntry);
    const actualSecure = isPasswordField ? !showPassword : false;

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <View style={styles.labelRow}>
                    <Text style={styles.label}>
                        {label.replace(/[\[\]]/g, '')}
                        {required && <Text style={styles.requiredStar}> *</Text>}
                    </Text>
                </View>
            )}

            <View
                style={[
                    styles.inputWrapper,
                    multiline && styles.inputWrapperMultiline,
                    {
                        borderColor: error ? Colors.danger : isFocused ? Colors.primary : '#E2E8F0',
                        backgroundColor: isFocused ? '#FFFFFF' : '#F8FAFC',
                    },
                    wrapperStyle,
                ]}
            >
                {icon && <View style={[styles.iconContainer, multiline && styles.iconContainerMultiline]}>{icon}</View>}
                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.inputMultiline,
                        isPasswordField && { paddingRight: 8 },
                        style,
                    ]}
                    multiline={multiline}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    placeholderTextColor="#94A3B8"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={actualSecure}
                    {...props}
                />
                {isPasswordField && (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setShowPassword((prev) => !prev)}
                        style={styles.eyeButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                            size={20}
                            color="#64748B"
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error ? (
                <Text style={styles.errorText}>⚠ {error}</Text>
            ) : hint ? (
                <Text style={styles.hintText}>{hint}</Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 14,
        width: '100%',
    },
    labelRow: {
        marginBottom: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#334155',
        letterSpacing: 0.1,
    },
    requiredStar: {
        color: '#E11D48',
        fontWeight: '700',
        fontSize: 13,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
        minHeight: 48,
    },
    inputWrapperMultiline: {
        alignItems: 'flex-start',
        paddingVertical: 10,
        minHeight: 80,
    },
    iconContainer: {
        marginRight: 10,
    },
    iconContainerMultiline: {
        marginTop: 2,
    },
    input: {
        flex: 1,
        fontSize: 13,
        color: Colors.textPrimary,
        fontWeight: '500',
        paddingVertical: 0,
    },
    inputMultiline: {
        textAlignVertical: 'top',
        minHeight: 60,
    },
    eyeButton: {
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 11,
        color: Colors.danger,
        fontWeight: '600',
        marginTop: 4,
    },
    hintText: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginTop: 4,
    },
});
