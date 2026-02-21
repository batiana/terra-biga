import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import TeRaga from "./pages/TeRaga";
import TeRagaProduct from "./pages/TeRagaProduct";
import { JoinGroup, IdentityForm, PaymentPage, ConfirmationPage } from "./pages/TeRagaFlow";
import MaCagnotte from "./pages/MaCagnotte";
import CagnotteCreate from "./pages/CagnotteCreate";
import CagnotteDetail from "./pages/CagnotteDetail";
import DonBigaConnect from "./pages/DonBigaConnect";
import Profil from "./pages/Profil";
import Admin from "./pages/Admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* Te Raga */}
      <Route path="/te-raga" component={TeRaga} />
      <Route path="/te-raga/:slug" component={TeRagaProduct} />
      <Route path="/te-raga/groupe/:groupId" component={JoinGroup} />
      <Route path="/te-raga/identite" component={IdentityForm} />
      <Route path="/te-raga/paiement" component={PaymentPage} />
      <Route path="/te-raga/confirmation" component={ConfirmationPage} />
      {/* Ma Cagnotte */}
      <Route path="/ma-cagnotte" component={MaCagnotte} />
      <Route path="/ma-cagnotte/creer" component={CagnotteCreate} />
      <Route path="/ma-cagnotte/:id" component={CagnotteDetail} />
      {/* Don BIGA CONNECT */}
      <Route path="/don-biga-connect" component={DonBigaConnect} />
      {/* Profil */}
      <Route path="/profil" component={Profil} />
      {/* Admin */}
      <Route path="/admin" component={Admin} />
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
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
