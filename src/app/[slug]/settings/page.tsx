"use client";

import { useEffect, useState, use } from "react";
import AdminSidebar from "@/components/AdminSidebar";

type SubscriptionPlan = "starter" | "growth" | "enterprise" | null;

export default function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>(null);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<{
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
  } | null>(null);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>("starter");

  useEffect(() => {
    setIsClient(true);
    setToken(localStorage.getItem("vc_access_token"));
  }, []);

  useEffect(() => {
    if (token && isClient) {
      fetchSubscriptionDetails();
    }
  }, [token, isClient]);

  const fetchSubscriptionDetails = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
      const response = await fetch(
        `${apiBase}/api/v1/admin/subscription/current`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const subscriptionData = data.data || data;
        setSubscription(subscriptionData);
        // Extract plan from the response structure
        const planTier =
          subscriptionData?.currentPlan?.tier ||
          subscriptionData?.subscription?.tier ||
          null;
        setCurrentPlan(planTier);
      }
    } catch (error) {
      console.error("Failed to fetch subscription details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
      const response = await fetch(
        `${apiBase}/api/v1/admin/subscription/change`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ plan: selectedPlan }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const result = data.data || data;
        setSubscription(result);
        setCurrentPlan(selectedPlan);
        setShowChangePlanModal(false);
        alert("Subscription plan updated successfully!");
        // Refresh subscription details
        fetchSubscriptionDetails();
      } else {
        const errorData = await response.json();
        alert(`Failed to update plan: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Failed to change subscription plan:", error);
      alert("Failed to change subscription plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const plans = {
    starter: {
      name: "Starter",
      price: "₦10,000",
      period: "month",
      features: [
        "Up to 50 members",
        "Basic reporting",
        "Email support",
        "Standard features",
      ],
    },
    growth: {
      name: "Growth",
      price: "₦25,000",
      period: "month",
      features: [
        "Up to 200 members",
        "Advanced reporting",
        "Priority support",
        "Custom integrations",
        "Activity logs",
      ],
    },
    enterprise: {
      name: "Enterprise",
      price: "₦50,000",
      period: "month",
      features: [
        "Unlimited members",
        "Advanced analytics",
        "Dedicated account manager",
        "Custom integrations",
        "Full API access",
        "White-label options",
      ],
    },
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
      <AdminSidebar slug={resolvedParams.slug} />

      {/* Main Content */}
      <div className="ml-64 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        {/* Current Subscription */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Current Subscription
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : (
            <>
              {currentPlan ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {plans[currentPlan].name} Plan
                    </h3>
                    <p className="text-3xl font-bold text-blue-600 mb-2">
                      {plans[currentPlan].price}
                      <span className="text-sm font-normal text-gray-500">
                        /{plans[currentPlan].period}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      {subscription?.status === "active"
                        ? "Active"
                        : "Inactive"}
                    </p>
                    <button
                      onClick={() => setShowChangePlanModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Change Plan
                    </button>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Plan Features
                    </h4>
                    <ul className="space-y-1">
                      {plans[currentPlan].features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <svg
                            className="w-4 h-4 text-green-500 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Active Subscription
                  </h3>
                  <p className="text-gray-600 mb-6">
                    You don&apos;t have an active subscription plan. Choose a
                    plan below to get started.
                  </p>
                  <button
                    onClick={() => setShowChangePlanModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Choose a Plan
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Available Plans */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Available Plans
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(plans).map(([planKey, plan]) => (
              <div
                key={planKey}
                className={`border rounded-lg p-6 ${
                  planKey === currentPlan
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {plan.price}
                    <span className="text-sm font-normal text-gray-500">
                      /{plan.period}
                    </span>
                  </p>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <svg
                        className="w-4 h-4 text-green-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {planKey === currentPlan ? (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedPlan(planKey as SubscriptionPlan);
                      setShowChangePlanModal(true);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Select Plan
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Change Plan Modal */}
      {showChangePlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Change Subscription Plan
            </h2>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                {currentPlan ? (
                  <>
                    Are you sure you want to change from{" "}
                    <strong>{plans[currentPlan].name}</strong> to{" "}
                    <strong>{selectedPlan && plans[selectedPlan].name}</strong>?
                  </>
                ) : (
                  <>
                    Are you sure you want to select the{" "}
                    <strong>{selectedPlan && plans[selectedPlan].name}</strong>{" "}
                    plan?
                  </>
                )}
              </p>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  New Plan Details:
                </h4>
                <p className="text-lg font-semibold text-blue-600">
                  {selectedPlan &&
                    `${plans[selectedPlan].price}/${plans[selectedPlan].period}`}
                </p>
                <ul className="mt-2 space-y-1">
                  {selectedPlan &&
                    plans[selectedPlan].features
                      .slice(0, 3)
                      .map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          • {feature}
                        </li>
                      ))}
                  {selectedPlan && plans[selectedPlan].features.length > 3 && (
                    <li className="text-sm text-gray-500">
                      • And {plans[selectedPlan].features.length - 3} more
                      features
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowChangePlanModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePlan}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Processing..." : "Confirm Change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
