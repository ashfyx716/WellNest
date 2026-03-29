import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as HotToaster } from "react-hot-toast";
import NotFound from "./pages/NotFound.tsx";
import SplashScreen from "./pages/SplashScreen.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import RoleSelectionPage from "./pages/RoleSelectionPage.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { NotificationProvider } from "./context/NotificationContext.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import MotherDashboardPage from "./pages/MotherDashboardPage.tsx";
import CheckinPage from "./pages/CheckinPage.tsx";
import JourneyPageRoute from "./pages/JourneyPageRoute.tsx";
import FamilyMessagesPage from "./pages/FamilyMessagesPage.tsx";
import SanctuaryPage from "./pages/SanctuaryPage.tsx";
import ReportsPage from "./pages/ReportsPage.tsx";
import PrivacyPage from "./pages/PrivacyPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import FamilyDashboardPage from "./pages/FamilyDashboardPage.tsx";
import LoveArchivePage from "./pages/LoveArchivePage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <HotToaster position="top-center" />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<SplashScreen />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/role-select" element={<RoleSelectionPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<MotherDashboardPage />} />
                  <Route path="/checkin" element={<CheckinPage />} />
                  <Route path="/journey" element={<JourneyPageRoute />} />
                  <Route path="/family-view" element={<FamilyMessagesPage />} />
                  <Route path="/sanctuary" element={<SanctuaryPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/settings/privacy" element={<PrivacyPage />} />
                  <Route path="/settings/profile" element={<ProfilePage />} />
                  <Route path="/family" element={<FamilyDashboardPage />} />
                  <Route path="/family/archive" element={<LoveArchivePage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
