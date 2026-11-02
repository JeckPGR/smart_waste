import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { Colors } from '../theme/colors';
import { PixelButton } from './PixelButton';

interface SlateDialogProps {
    visible: boolean;
    title: string;
    description?: string;
    icon?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    children?: React.ReactNode;
}

export function SlateDialog({
    visible,
    title,
    description,
    icon,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    isDestructive = false,
    loading = false,
    onConfirm,
    onCancel,
    children,
}: SlateDialogProps) {
    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.backdrop}>
                    <TouchableWithoutFeedback>
                        <View style={styles.card}>
                            {icon && (
                                <View style={[styles.iconBox, isDestructive && styles.iconBoxDanger]}>
                                    {icon}
                                </View>
                            )}

                            <Text style={styles.title}>{title}</Text>
                            {description && <Text style={styles.description}>{description}</Text>}

                            {children && <View style={styles.customContent}>{children}</View>}

                            <View style={styles.actionsRow}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <PixelButton
                                        title={cancelText}
                                        onPress={onCancel}
                                        variant="secondary"
                                        size="md"
                                        disabled={loading}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <PixelButton
                                        title={confirmText}
                                        onPress={onConfirm}
                                        variant={isDestructive ? 'danger' : 'primary'}
                                        size="md"
                                        loading={loading}
                                    />
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 22,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    iconBoxDanger: {
        backgroundColor: '#FFE4E6',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 6,
    },
    description: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
        marginBottom: 18,
    },
    customContent: {
        marginBottom: 16,
    },
    actionsRow: {
        flexDirection: 'row',
        marginTop: 6,
    },
});
