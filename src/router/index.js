import { createRouter, createWebHistory } from "vue-router";

import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/",
    name: "landing",
    component: () => import("@/views/public/LandingView.vue"),
    meta: { public: true }
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/public/LoginView.vue"),
    meta: { public: true }
  },
  {
    path: "/demo-tema",
    name: "theme-demo",
    component: () => import("@/views/public/ThemeDemoView.vue"),
    meta: { public: true }
  },
  {
    path: "/app",
    component: () => import("@/layouts/MemberLayout.vue"),
    meta: { requiresAuth: true, role: "member" },
    children: [
      {
        path: "onboarding",
        name: "member-onboarding",
        component: () => import("@/views/member/OnboardingView.vue"),
        meta: { allowsIncompleteOnboarding: true }
      },
      {
        path: "dashboard",
        name: "member-dashboard",
        component: () => import("@/views/member/DashboardView.vue")
      },
      {
        path: "invitations",
        name: "member-invitations",
        component: () => import("@/views/member/InvitationsView.vue")
      },
      {
        path: "invitations/new",
        name: "member-invitation-new",
        component: () => import("@/views/member/NewInvitationView.vue")
      },
      {
        path: "invitations/:id",
        name: "member-invitation-detail",
        component: () => import("@/views/member/InvitationBuilderView.vue")
      },
      {
        path: "invitations/:id/edit",
        name: "member-invitation-edit",
        component: () => import("@/views/member/InvitationBuilderView.vue")
      },
      {
        path: "invitations/:id/preview",
        name: "member-invitation-preview",
        component: () => import("@/views/member/InvitationPreviewView.vue")
      },
      {
        path: "invitations/:id/guests",
        name: "member-invitation-guests",
        component: () => import("@/views/member/InvitationGuestsView.vue")
      },
      {
        path: "credits/buy",
        name: "member-buy-credits",
        component: () => import("@/views/member/BuyCreditsView.vue")
      },
      {
        path: "transactions",
        name: "member-transactions",
        component: () => import("@/views/member/TransactionsView.vue")
      },
      {
        path: "transactions/:id",
        name: "member-transaction-detail",
        component: () => import("@/views/member/TransactionDetailView.vue")
      },
      {
        path: "branding",
        name: "member-branding",
        component: () => import("@/views/member/BrandingView.vue")
      },
      {
        path: "settings",
        name: "member-settings",
        component: () => import("@/views/member/SettingsView.vue")
      }
    ]
  },
  {
    path: "/admin",
    component: () => import("@/layouts/AdminLayout.vue"),
    meta: { requiresAuth: true, role: "admin" },
    children: [
      {
        path: "dashboard",
        name: "admin-dashboard",
        component: () => import("@/views/admin/AdminDashboardView.vue")
      },
      {
        path: "payments",
        name: "admin-payments",
        component: () => import("@/views/admin/AdminPaymentsView.vue")
      },
      {
        path: "members",
        name: "admin-members",
        component: () => import("@/views/admin/AdminMembersView.vue")
      },
      {
        path: "invitations",
        name: "admin-invitations",
        component: () => import("@/views/admin/AdminInvitationsView.vue")
      },
      {
        path: "credit-packages",
        name: "admin-credit-packages",
        component: () => import("@/views/admin/AdminCreditPackagesView.vue")
      },
      {
        path: "themes",
        name: "admin-themes",
        component: () => import("@/views/admin/AdminThemesView.vue")
      },
      {
        path: "music",
        name: "admin-music",
        component: () => import("@/views/admin/AdminMusicView.vue")
      },
      {
        path: "reports",
        name: "admin-reports",
        component: () => import("@/views/admin/AdminReportsView.vue")
      },
      {
        path: "audit-logs",
        name: "admin-audit-logs",
        component: () => import("@/views/admin/AdminAuditLogsView.vue")
      }
    ]
  },
  {
    path: "/:username/:slug",
    name: "public-invitation",
    component: () => import("@/views/public/PublicInvitationView.vue"),
    meta: { public: true }
  },
  {
    path: "/:username/:slug/t/:token",
    name: "public-guest-invitation",
    component: () => import("@/views/public/PublicInvitationView.vue"),
    meta: { public: true }
  },
  {
    path: "/:username/:slug/guest/:token",
    name: "public-guest-invitation-legacy",
    component: () => import("@/views/public/PublicInvitationView.vue"),
    meta: { public: true }
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/"
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (!auth.ready) {
    await auth.hydrate();
  }

  if (to.name === "login" && auth.isAuthenticated) {
    return auth.isAdmin ? { name: "admin-dashboard" } : routeForMember(auth);
  }

  if (!to.meta.requiresAuth) {
    return true;
  }

  if (!auth.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  if (to.meta.role && auth.user.role !== to.meta.role) {
    return auth.isAdmin ? { name: "admin-dashboard" } : routeForMember(auth);
  }

  if (auth.isMember && auth.needsOnboarding && !to.meta.allowsIncompleteOnboarding) {
    return { name: "member-onboarding" };
  }

  if (auth.isMember && !auth.needsOnboarding && to.name === "member-onboarding") {
    return { name: "member-dashboard" };
  }

  return true;
});

function routeForMember(auth) {
  return auth.needsOnboarding ? { name: "member-onboarding" } : { name: "member-dashboard" };
}

export default router;
