/**
 * Checks if the given pathname corresponds to the AI Agent Onboarding pages.
 *
 * Valid paths:
 * - `/app/ai-agent/onboarding`
 * - `/app/ai-agent/shopify/store-name/onboarding`
 *
 * @param pathname The URL pathname to check.
 * @returns `true` if it's an AI Agent Onboarding page, otherwise `false`.
 */
export const isAiAgentOnboarding = (pathname: string): boolean => {
    return /^\/app\/ai-agent(\/[\w-]+\/[\w-]+)?\/onboarding\/?$/.test(pathname)
}
