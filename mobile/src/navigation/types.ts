export type RootStackParamList = {
    Splash: undefined;
    Login: { successMessage?: string; email?: string } | undefined;
    Register: undefined;
    MainTabs: undefined;
    CreateReport: undefined;
    ReportDetail: { reportId: string };
    Leaderboard: undefined;
};

export type MainTabParamList = {
    DashboardTab: undefined;
    ReportsTab: undefined;
    LeaderboardTab: undefined;
    ProfileTab: undefined;
};
