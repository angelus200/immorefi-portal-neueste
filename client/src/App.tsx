import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/crm/Leads";
import Pipeline from "./pages/crm/Pipeline";
import Contacts from "./pages/crm/Contacts";
import Booking from "./pages/Booking";
import MyCalendar from "./pages/admin/MyCalendar";
import AdminBookings from "./pages/admin/Bookings";
import AdminUsers from "./pages/admin/Users";
import AdminAudit from "./pages/admin/Audit";
import AdminSettings from "./pages/admin/Settings";
import Onboarding from "./pages/Onboarding";
import Documents from "./pages/Documents";
import Tasks from "./pages/Tasks";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import Contracts from "./pages/Contracts";
import AdminContracts from "./pages/admin/Contracts";
import AdminContractTemplates from "./pages/admin/ContractTemplates";
import AdminOrders from "./pages/admin/Orders";
import AdminOnboardingData from "./pages/admin/OnboardingData";
import AdminInvoices from "./pages/admin/Invoices";
import AdminMessages from "./pages/admin/Messages";
import AdminHandbuch from "./pages/AdminHandbuch";
import Shop from "./pages/Shop";
import ShopSuccess from "./pages/ShopSuccess";
import Orders from "./pages/Orders";
import Invoices from "./pages/Invoices";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Team from "./pages/Team";
import Press from "./pages/Press";
import { CookieBanner } from "./components/CookieBanner";
import { ChatWidget } from "./components/ChatWidget";
import { WelcomeModal } from "./components/WelcomeModal";
import InterestCalculator from "./pages/tools/InterestCalculator";
import RefinanceCalculator from "./pages/tools/RefinanceCalculator";
import ROECalculator from "./pages/tools/ROECalculator";
import Glossary from "./pages/tools/Glossary";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-in/factor-one" component={SignIn} />
      <Route path="/sign-in/factor-two" component={SignIn} />
      <Route path="/sign-in/verify" component={SignIn} />
      <Route path="/sign-in/verify-email-address" component={SignIn} />
      <Route path="/sign-in/sso-callback" component={SignIn} />
      <Route path="/sign-up" component={SignUp} />
      <Route path="/sign-up/verify" component={SignUp} />
      <Route path="/sign-up/verify-email-address" component={SignUp} />
      <Route path="/sign-up/sso-callback" component={SignUp} />
      <Route path="/shop" component={Shop} />
      <Route path="/shop/success" component={ShopSuccess} />
      <Route path="/impressum" component={Impressum} />
      <Route path="/datenschutz" component={Datenschutz} />
      <Route path="/about" component={About} />
      <Route path="/team" component={Team} />
      <Route path="/press" component={Press} />
      
      {/* Client Portal Routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/tools/interest-calculator" component={InterestCalculator} />
      <Route path="/tools/refinance-calculator" component={RefinanceCalculator} />
      <Route path="/tools/roe-calculator" component={ROECalculator} />
      <Route path="/tools/glossary" component={Glossary} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/documents" component={Documents} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/orders" component={Orders} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/settings" component={Settings} />
      
      {/* Booking Routes */}
      <Route path="/booking" component={Booking} />

      {/* CRM Routes */}
      <Route path="/crm/leads" component={Leads} />
      <Route path="/crm/deals" component={Pipeline} />
      <Route path="/crm/contacts" component={Contacts} />

      {/* Admin Routes */}
      <Route path="/admin/my-calendar" component={MyCalendar} />
      <Route path="/admin/bookings" component={AdminBookings} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/audit" component={AdminAudit} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/contracts" component={AdminContracts} />
      <Route path="/admin/contract-templates" component={AdminContractTemplates} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/onboarding" component={AdminOnboardingData} />
      <Route path="/admin/invoices" component={AdminInvoices} />
      <Route path="/admin/messages" component={AdminMessages} />
      <Route path="/admin/handbuch" component={AdminHandbuch} />
      
      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieBanner />
          <ChatWidget />
          <WelcomeModal />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
