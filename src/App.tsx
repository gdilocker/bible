import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DrawerProvider } from './contexts/DrawerContext';
import ProtectedRoute from './components/ProtectedRoute';
import { SubscriptionProtectedRoute } from './components/SubscriptionProtectedRoute';
import ResellerProtectedRoute from './components/ResellerProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { InstallAppButton } from './components/InstallAppButton';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Transfer from './pages/Transfer';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';
import RefundPolicy from './pages/RefundPolicy';
import SuspensionPolicy from './pages/SuspensionPolicy';
import AcceptableUsePolicy from './pages/AcceptableUsePolicy';
import CommunityStandards from './pages/CommunityStandards';
import SecurityPolicy from './pages/SecurityPolicy';
import DomainTransferPolicy from './pages/DomainTransferPolicy';
import UserContentPolicy from './pages/UserContentPolicy';
import CopyrightNotice from './pages/CopyrightNotice';
import LegalCompliance from './pages/LegalCompliance';
import DataProcessingAddendum from './pages/DataProcessingAddendum';
import AccessibilityPolicy from './pages/AccessibilityPolicy';
import DeletionPolicy from './pages/DeletionPolicy';
import DataRequestPolicy from './pages/DataRequestPolicy';
import FAQ from './pages/FAQ';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Failure from './pages/Failure';
import Orders from './pages/Orders';
import PayPalReturn from './pages/PayPalReturn';
import PayPalCancel from './pages/PayPalCancel';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminResellers from './pages/AdminResellers';
import AdminUsers from './pages/AdminUsers';
import AdminOrders from './pages/AdminOrders';
import AdminSettings from './pages/AdminSettings';
import AdminLogs from './pages/AdminLogs';
import AdminChatbot from './pages/AdminChatbot';
import DomainDetails from './pages/DomainDetails';
import PanelDashboard from './pages/PanelDashboard';
import Billing from './pages/Billing';
import AccountSettings from './pages/AccountSettings';
import DomainsPageNew from './pages/DomainsPage';
import Support from './pages/Support';
import SupportNew from './pages/SupportNew';
import SupportArticle from './pages/SupportArticle';
import OpenTicket from './pages/OpenTicket';
import DNSManagement from './pages/DNSManagement';
import ResellerDashboard from './pages/ResellerDashboard';
import Marketplace from './pages/Marketplace';
import AdminSuggestions from './pages/AdminSuggestions';
import AdminReservedKeywords from './pages/AdminReservedKeywords';
import AdminProtectedBrands from './pages/AdminProtectedBrands';
import AdminLinkModeration from './pages/AdminLinkModeration';
import DiagnosticTest from './pages/DiagnosticTest';
import PublicProfile from './pages/PublicProfile';
import ProfileManager from './pages/ProfileManager';
import AdminProfiles from './pages/AdminProfiles';
import AffiliateTerms from './pages/AffiliateTerms';
import AffiliateAbout from './pages/AffiliateAbout';
import AffiliateDashboard from './pages/AffiliateDashboard';
import TwoFactorSetup from './pages/TwoFactorSetup';
import DomainSlugPage from './pages/DomainSlugPage';
import DomainTransfer from './pages/DomainTransfer';
import SocialFeed from './pages/SocialFeed';
import MyProfile from './pages/MyProfile';
import ProfilePreview from './pages/ProfilePreview';
import SavedPosts from './pages/SavedPosts';
import AdminSocialModeration from './pages/AdminSocialModeration';
import PublicStore from './pages/PublicStore';
import StoreManager from './pages/StoreManager';
import RefRedirect from './pages/RefRedirect';
import StoreTerms from './pages/StoreTerms';
import SocialTerms from './pages/SocialTerms';
import RichClub from './pages/RichClub';
import AdminEmail from './pages/AdminEmail';

function App() {
  return (
    <AuthProvider>
      <DrawerProvider>
        <Router>
          <AppRoutes />
        </Router>
      </DrawerProvider>
    </AuthProvider>
  );
}

// Separate component to handle routes with conditional layout
function AppRoutes() {
  const location = useLocation();
  const pathname = location.pathname;

  // Don't show Header/Footer on panel pages, dashboard, and public profiles
  // Define known public routes that should show Header/Footer
  const publicRoutes = [
    '/', '/pt', '/en', '/es', '/valores', '/transferencia', '/contato', '/contact',
    '/termos', '/politica', '/cookies', '/faq', '/premium', '/club',
    '/suporte', '/checkout', '/sucesso', '/falha',
    '/paypal/return', '/paypal/cancel', '/diagnostic',
    '/login', '/register', '/politica-reembolso', '/politica-suspensao',
    '/politica-uso-aceitavel', '/politica-padroes-comunidade',
    '/politica-seguranca', '/politica-transferencia-dominio',
    '/politica-conteudo-usuario', '/aviso-direitos-autorais',
    '/conformidade-legal', '/adendo-processamento-dados',
    '/politica-acessibilidade', '/politica-exclusao', '/politica-solicitacao-dados'
  ];

  // Check if path starts with known public route prefixes
  const isKnownPublicRoute = publicRoutes.includes(pathname) ||
                              pathname.startsWith('/afiliados/') ||
                              pathname.startsWith('/suporte/');

  // Only match public profile/domain slug if it's a simple path not in known routes
  const isDynamicRoute = !isKnownPublicRoute && pathname.match(/^\/[a-zA-Z0-9_-]+$/);

  const hideLayout = pathname.startsWith('/panel/') ||
                     pathname.startsWith('/admin/') ||
                     pathname === '/app' ||
                     pathname === '/dashboard' ||
                     pathname === '/app/dashboard' ||
                     pathname === '/meu-perfil' ||
                     pathname === '/minha-pagina' ||
                     pathname === '/salvos' ||
                     pathname.startsWith('/social') ||
                     pathname.includes('/loja') ||
                     isDynamicRoute;

  return (
    <>
      {!hideLayout && <Header />}
      <main className={hideLayout ? '' : 'flex-1'}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/pt" element={<Home />} />
          <Route path="/en" element={<Home />} />
          <Route path="/es" element={<Home />} />
          <Route path="/valores" element={<Pricing />} />
          <Route path="/transferencia" element={<Transfer />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/termos" element={<Terms />} />
          <Route path="/politica" element={<Privacy />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/afiliados/termos" element={<AffiliateTerms />} />
          <Route path="/afiliados/sobre" element={<AffiliateAbout />} />
          <Route path="/afiliados" element={
            <ProtectedRoute>
              <AffiliateDashboard />
            </ProtectedRoute>
          } />
          <Route path="/politica-reembolso" element={<RefundPolicy />} />
          <Route path="/politica-suspensao" element={<SuspensionPolicy />} />
          <Route path="/politica-uso-aceitavel" element={<AcceptableUsePolicy />} />
          <Route path="/politica-padroes-comunidade" element={<CommunityStandards />} />
          <Route path="/politica-seguranca" element={<SecurityPolicy />} />
          <Route path="/politica-transferencia-dominio" element={<DomainTransferPolicy />} />
          <Route path="/politica-conteudo-usuario" element={<UserContentPolicy />} />
          <Route path="/aviso-direitos-autorais" element={<CopyrightNotice />} />
          <Route path="/conformidade-legal" element={<LegalCompliance />} />
          <Route path="/adendo-processamento-dados" element={<DataProcessingAddendum />} />
          <Route path="/politica-acessibilidade" element={<AccessibilityPolicy />} />
          <Route path="/politica-exclusao" element={<DeletionPolicy />} />
          <Route path="/politica-solicitacao-dados" element={<DataRequestPolicy />} />
          <Route path="/policies/store-terms" element={<StoreTerms />} />
          <Route path="/policies/social-terms" element={<SocialTerms />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/premium" element={<Marketplace />} />
          <Route path="/club" element={<RichClub />} />
          <Route path="/suporte" element={<SupportNew />} />
          <Route path="/suporte/abrir-chamado" element={<OpenTicket />} />
          <Route path="/suporte/:slug" element={<SupportArticle />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/sucesso" element={<Success />} />
          <Route path="/falha" element={<Failure />} />
          <Route path="/paypal/return" element={<PayPalReturn />} />
          <Route path="/paypal/cancel" element={<PayPalCancel />} />

          {/* Diagnostic Route */}
          <Route path="/diagnostic" element={<DiagnosticTest />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/iniciar" element={<Register />} />

          {/* Affiliate Redirect Route */}
          <Route path="/r/:code" element={<RefRedirect />} />

          {/* Social Network Routes */}
          <Route path="/social" element={<SocialFeed />} />
          <Route path="/salvos" element={<SavedPosts />} />
          <Route path="/social/:subdomain" element={<SocialFeed />} />
          <Route path="/meu-perfil" element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          } />
          <Route path="/minha-pagina" element={
            <ProtectedRoute>
              <ProfilePreview />
            </ProtectedRoute>
          } />

          {/* Protected User Routes - Unified Dashboard */}
          <Route path="/app" element={
            <ProtectedRoute>
              <SubscriptionProtectedRoute>
                <UserDashboard />
              </SubscriptionProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <SubscriptionProtectedRoute>
                <UserDashboard />
              </SubscriptionProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/app/dashboard" element={
            <ProtectedRoute>
              <SubscriptionProtectedRoute>
                <UserDashboard />
              </SubscriptionProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/app/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/app/orders/:orderId" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/app/support" element={<Contact />} />

          {/* New Panel Routes */}
          <Route path="/panel/dashboard" element={
            <ProtectedRoute>
              <PanelDashboard />
            </ProtectedRoute>
          } />
          <Route path="/panel/billing" element={
            <ProtectedRoute>
              <SubscriptionProtectedRoute>
                <Billing />
              </SubscriptionProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/panel/settings" element={
            <ProtectedRoute>
              <SubscriptionProtectedRoute>
                <AccountSettings />
              </SubscriptionProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/panel/settings/2fa" element={
            <ProtectedRoute>
              <TwoFactorSetup />
            </ProtectedRoute>
          } />
          <Route path="/panel/domains" element={
            <ProtectedRoute>
              <DomainsPageNew />
            </ProtectedRoute>
          } />
          <Route path="/panel/domains/:id" element={
            <ProtectedRoute>
              <DomainDetails />
            </ProtectedRoute>
          } />
          <Route path="/panel/domains/:id/transfer" element={
            <ProtectedRoute>
              <DomainTransfer />
            </ProtectedRoute>
          } />
          <Route path="/panel/dns" element={
            <ProtectedRoute>
              <DNSManagement />
            </ProtectedRoute>
          } />
          <Route path="/panel/revendedor" element={
            <ResellerProtectedRoute>
              <ResellerDashboard />
            </ResellerProtectedRoute>
          } />
          <Route path="/panel/support" element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          } />
          <Route path="/panel/profile" element={
            <ProtectedRoute>
              <ProfileManager />
            </ProtectedRoute>
          } />
          <Route path="/panel/profile/:domainId" element={
            <ProtectedRoute>
              <ProfileManager />
            </ProtectedRoute>
          } />

          {/* Protected Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/domains" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute adminOnly>
              <AdminOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute adminOnly>
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/revendedores" element={
            <ProtectedRoute adminOnly>
              <AdminResellers />
            </ProtectedRoute>
          } />
          <Route path="/admin/suggestions" element={
            <ProtectedRoute adminOnly>
              <AdminSuggestions />
            </ProtectedRoute>
          } />
          <Route path="/admin/sugestoes" element={
            <ProtectedRoute adminOnly>
              <AdminSuggestions />
            </ProtectedRoute>
          } />
          <Route path="/admin/reserved-keywords" element={
            <ProtectedRoute adminOnly>
              <AdminReservedKeywords />
            </ProtectedRoute>
          } />
          <Route path="/admin/protected-brands" element={
            <ProtectedRoute adminOnly>
              <AdminProtectedBrands />
            </ProtectedRoute>
          } />
          <Route path="/admin/link-moderation" element={
            <ProtectedRoute adminOnly>
              <AdminLinkModeration />
            </ProtectedRoute>
          } />
          <Route path="/admin/social-moderation" element={
            <ProtectedRoute adminOnly>
              <AdminSocialModeration />
            </ProtectedRoute>
          } />
          <Route path="/admin/profiles" element={
            <ProtectedRoute adminOnly>
              <AdminProfiles />
            </ProtectedRoute>
          } />
          <Route path="/admin/logs" element={
            <ProtectedRoute adminOnly>
              <AdminLogs />
            </ProtectedRoute>
          } />
          <Route path="/admin/chatbot" element={
            <ProtectedRoute adminOnly>
              <AdminChatbot />
            </ProtectedRoute>
          } />
          <Route path="/admin/email" element={
            <ProtectedRoute adminOnly>
              <AdminEmail />
            </ProtectedRoute>
          } />

          {/* Store Routes */}
          <Route path="/panel/loja" element={
            <ProtectedRoute>
              <StoreManager />
            </ProtectedRoute>
          } />
          <Route path="/:subdomain/loja" element={<PublicStore />} />

          {/* Dynamic Route (Domain Slug or Public Profile) - Must be last to catch all */}
          <Route path="/:slug" element={<DomainSlugPage />} />
        </Routes>
      </main>
      {!hideLayout && <Footer />}
      {(pathname === '/suporte' || pathname.startsWith('/suporte/')) && <ChatWidget />}
      <PWAInstallPrompt />
      <InstallAppButton />
    </>
  );
}

export default App;