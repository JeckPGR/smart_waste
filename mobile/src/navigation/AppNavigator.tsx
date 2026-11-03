import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { LoginScreen } from '@/modules/auth/screens/LoginScreen';
import { RegisterScreen } from '@/modules/auth/screens/RegisterScreen';
import { SplashScreen } from '@/modules/auth/screens/SplashScreen';
import { DashboardScreen } from '@/modules/dashboard/screens/DashboardScreen';
import { LeaderboardScreen } from '@/modules/dashboard/screens/LeaderboardScreen';
import { ProfileScreen } from '@/modules/profile/screens/ProfileScreen';
import { CreateReportScreen } from '@/modules/reports/screens/CreateReportScreen';
import { ReportDetailScreen } from '@/modules/reports/screens/ReportDetailScreen';
import { ReportsListScreen } from '@/modules/reports/screens/ReportsListScreen';
import { Colors } from '@/shared/theme/colors';
import { MainTabParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator({ navigation: rootNavigation }: any) {
    const insets = useSafeAreaInsets();
    // Ensure sufficient bottom padding above Android system 3-button bar / gesture pill
    const bottomPadding = insets.bottom > 0 ? insets.bottom + 6 : (Platform.OS === 'android' ? 16 : 8);
    const tabBarHeight = 58 + bottomPadding;

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#E2E8F0',
                    height: tabBarHeight,
                    paddingBottom: bottomPadding,
                    paddingTop: 8,
                    elevation: 10,
                    shadowColor: '#0F172A',
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: '#64748B',
                tabBarLabelStyle: styles.tabLabel,
            }}
        >
            <Tab.Screen
                name="DashboardTab"
                options={{
                    tabBarLabel: 'Beranda',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={styles.tabIconWrap}>
                            <Ionicons
                                name={focused ? 'home' : 'home-outline'}
                                size={22}
                                color={color}
                            />
                            {focused && <View style={styles.activeIndicator} />}
                        </View>
                    ),
                }}
            >
                {({ navigation: tabNav }: any) => (
                    <DashboardScreen
                        onNavigateCreateReport={() => rootNavigation.navigate('CreateReport')}
                        onNavigateReportsList={() => tabNav.navigate('ReportsTab')}
                        onNavigateDetail={(id) => rootNavigation.navigate('ReportDetail', { reportId: id })}
                        onNavigateLeaderboard={() => rootNavigation.navigate('Leaderboard')}
                    />
                )}
            </Tab.Screen>

            <Tab.Screen
                name="ReportsTab"
                options={{
                    tabBarLabel: 'Laporan',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={styles.tabIconWrap}>
                            <Ionicons
                                name={focused ? 'document-text' : 'document-text-outline'}
                                size={22}
                                color={color}
                            />
                            {focused && <View style={styles.activeIndicator} />}
                        </View>
                    ),
                }}
            >
                {() => (
                    <ReportsListScreen
                        onNavigateCreate={() => rootNavigation.navigate('CreateReport')}
                        onNavigateDetail={(id) => rootNavigation.navigate('ReportDetail', { reportId: id })}
                    />
                )}
            </Tab.Screen>

            <Tab.Screen
                name="LeaderboardTab"
                options={{
                    tabBarLabel: 'Podium',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={styles.tabIconWrap}>
                            <Ionicons
                                name={focused ? 'trophy' : 'trophy-outline'}
                                size={22}
                                color={color}
                            />
                            {focused && <View style={styles.activeIndicator} />}
                        </View>
                    ),
                }}
            >
                {() => <LeaderboardScreen />}
            </Tab.Screen>

            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profil',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={styles.tabIconWrap}>
                            <Ionicons
                                name={focused ? 'person' : 'person-outline'}
                                size={22}
                                color={color}
                            />
                            {focused && <View style={styles.activeIndicator} />}
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

export function AppNavigator() {
    const { user, isFirstLaunch, markSplashSeen, loading } = useAuth();

    if (loading) {
        return (
            <View style={styles.loadingScreen}>
                <View style={styles.loadingLogoBox}>
                    <Image
                        source={require('../../assets/smart-waste-mascot.png')}
                        style={styles.loadingMascot}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.loadingText}>Smart Waste</Text>
                <Text style={styles.loadingSub}>Memuat sistem...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    // Authenticated Stack
                    <>
                        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                        <Stack.Screen
                            name="CreateReport"
                            options={{ presentation: 'modal' }}
                        >
                            {({ navigation }) => (
                                <CreateReportScreen
                                    onSuccess={() => navigation.goBack()}
                                    onCancel={() => navigation.goBack()}
                                />
                            )}
                        </Stack.Screen>
                        <Stack.Screen name="ReportDetail">
                            {({ route, navigation }) => (
                                <ReportDetailScreen
                                    reportId={route.params.reportId}
                                    onBack={() => navigation.goBack()}
                                    onDeleted={() => navigation.goBack()}
                                />
                            )}
                        </Stack.Screen>
                        <Stack.Screen name="Leaderboard">
                            {({ navigation }) => (
                                <LeaderboardScreen onBack={() => navigation.goBack()} />
                            )}
                        </Stack.Screen>
                    </>
                ) : (
                    // Unauthenticated Stack
                    <>
                        {isFirstLaunch && (
                            <Stack.Screen name="Splash">
                                {() => (
                                    <SplashScreen
                                        onGetStarted={async () => {
                                            await markSplashSeen();
                                        }}
                                        onLoginPress={async () => {
                                            await markSplashSeen();
                                        }}
                                    />
                                )}
                            </Stack.Screen>
                        )}
                        <Stack.Screen name="Login">
                            {({ navigation, route }: any) => (
                                <LoginScreen
                                    onNavigateRegister={() => navigation.navigate('Register')}
                                    successMessage={route?.params?.successMessage}
                                    initialEmail={route?.params?.email}
                                />
                            )}
                        </Stack.Screen>
                        <Stack.Screen name="Register">
                            {({ navigation }: any) => (
                                <RegisterScreen
                                    onNavigateLogin={() => navigation.navigate('Login')}
                                    onRegisterSuccess={(email: string) => {
                                        navigation.navigate('Login', {
                                            successMessage: 'Akun berhasil terbuat! Silakan login untuk melanjutkan.',
                                            email,
                                        });
                                    }}
                                />
                            )}
                        </Stack.Screen>
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingScreen: {
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingLogoBox: {
        width: 76,
        height: 76,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    loadingMascot: {
        width: 54,
        height: 54,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: 0.2,
    },
    loadingSub: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    tabIconWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 28,
        width: 36,
    },
    activeIndicator: {
        width: 12,
        height: 2,
        backgroundColor: Colors.primary,
        borderRadius: 1,
        marginTop: 2,
    },
});
