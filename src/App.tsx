import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/admin'
import { ADMIN_ROUTES } from './constants/adminRoutes'
import {
  AdminAnomaliesPage,
  AdminAuditPage,
  AdminDashboardPage,
  AdminInventoryPage,
  AdminLivePassesPage,
  AdminMenuTrendsPage,
  AdminNotificationsPage,
  AdminOrdersPage,
  AdminPrivacyPage,
  AdminRewardTiersPage,
  AdminRewardHistoryPage,
  AdminSalesPage,
  AdminSettingsPage,
  AdminTimeSalesPage,
  AdminTeamPage,
  AdminWifiPoliciesPage,
} from './routes/admin'
import { CustomerPortalPage } from './routes/customer/CustomerPortalPage'

function App() {
  return (
    <Routes>
      <Route path="/app/customer" element={<CustomerPortalPage />} />
      <Route path="/connect" element={<CustomerPortalPage />} />
      <Route element={<AdminLayout />}>
        <Route path={ADMIN_ROUTES.dashboard} element={<AdminDashboardPage />} />
        <Route path={ADMIN_ROUTES.aiSales} element={<AdminSalesPage />} />
        <Route path={ADMIN_ROUTES.aiTimeSales} element={<AdminTimeSalesPage />} />
        <Route path={ADMIN_ROUTES.aiInventory} element={<AdminInventoryPage />} />
        <Route path={ADMIN_ROUTES.aiMenuTrends} element={<AdminMenuTrendsPage />} />
        <Route path={ADMIN_ROUTES.livePasses} element={<AdminLivePassesPage />} />
        <Route path={ADMIN_ROUTES.wifiPolicies} element={<AdminWifiPoliciesPage />} />
        <Route path={ADMIN_ROUTES.rewardTiers} element={<AdminRewardTiersPage />} />
        <Route path={ADMIN_ROUTES.rewardHistory} element={<AdminRewardHistoryPage />} />
        <Route path={ADMIN_ROUTES.orders} element={<AdminOrdersPage />} />
        <Route path={ADMIN_ROUTES.notifications} element={<AdminNotificationsPage />} />
        <Route path={ADMIN_ROUTES.anomalies} element={<AdminAnomaliesPage />} />
        <Route path={ADMIN_ROUTES.team} element={<AdminTeamPage />} />
        <Route path={ADMIN_ROUTES.audit} element={<AdminAuditPage />} />
        <Route path={ADMIN_ROUTES.settings} element={<AdminSettingsPage />} />
        <Route path={ADMIN_ROUTES.privacy} element={<AdminPrivacyPage />} />
      </Route>
      <Route path="*" element={<Navigate to={ADMIN_ROUTES.dashboard} replace />} />
    </Routes>
  )
}

export default App
