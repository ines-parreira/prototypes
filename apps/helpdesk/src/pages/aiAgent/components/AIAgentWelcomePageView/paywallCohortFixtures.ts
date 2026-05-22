/**
 * Cohort × expected-CTAs parity table.
 *
 * Locks the decision matrix encoded in V2's `useAiAgentCtas`. V3 can later
 * assert against the same fixture so changes that diverge from V2 are
 * intentional (or covered by an entry that is explicitly marked V3-only).
 *
 * `expectedCtas` is ordered: index 0 = primary, 1 = secondary, 2 = tertiary.
 * An empty array means "no CTAs are rendered" (non-admin without notify).
 */

export type PaywallCohortInput = {
    canStartOnboarding: boolean
    hasAutomate: boolean
    canBookDemo: boolean
    canNotifyAdmin: boolean
    canSeeTrial: boolean
    canSeeSubscribeNow: boolean
    isAdmin: boolean
    isOnboarded: boolean
    isOnUpdateOnboardingWizard: boolean
    isNotifyAdminDisabled: boolean
}

export type ExpectedCta = {
    label: string
    isDisabled?: boolean
}

export type PaywallCohortFixture = {
    name: string
    inputs: PaywallCohortInput
    expectedCtas: ExpectedCta[]
    /**
     * V3 §5 (CRMGROW-3797) intentional divergence from V2. When set, the V3
     * parity branch asserts against this list instead of `expectedCtas`.
     */
    v3ExpectedCtas?: ExpectedCta[]
}

const baseInput: PaywallCohortInput = {
    canStartOnboarding: false,
    hasAutomate: false,
    canBookDemo: false,
    canNotifyAdmin: false,
    canSeeTrial: false,
    canSeeSubscribeNow: false,
    isAdmin: false,
    isOnboarded: false,
    isOnUpdateOnboardingWizard: false,
    isNotifyAdminDisabled: false,
}

export const paywallCohortFixtures: PaywallCohortFixture[] = [
    {
        name: 'canStartOnboarding wins regardless of admin or trial state (new install)',
        inputs: { ...baseInput, canStartOnboarding: true },
        expectedCtas: [{ label: 'Set Up AI Agent' }],
    },
    {
        name: 'canStartOnboarding while updating wizard relabels to "Continue Setup"',
        inputs: {
            ...baseInput,
            canStartOnboarding: true,
            isOnUpdateOnboardingWizard: true,
        },
        expectedCtas: [{ label: 'Continue Setup' }],
    },
    {
        name: 'non-admin without notify capability renders nothing',
        inputs: { ...baseInput, isAdmin: false },
        expectedCtas: [],
    },
    {
        name: 'non-admin can notify, no demo: Notify admin + Learn more',
        inputs: { ...baseInput, canNotifyAdmin: true },
        expectedCtas: [{ label: 'Notify admin' }, { label: 'Learn more' }],
    },
    {
        name: 'non-admin can notify, can book demo: Notify admin + Book a demo + Learn more',
        inputs: { ...baseInput, canNotifyAdmin: true, canBookDemo: true },
        expectedCtas: [
            { label: 'Notify admin' },
            { label: 'Book a demo' },
            { label: 'Learn more' },
        ],
    },
    {
        name: 'non-admin who already notified: primary CTA disabled and relabeled',
        inputs: {
            ...baseInput,
            canNotifyAdmin: true,
            isNotifyAdminDisabled: true,
        },
        expectedCtas: [
            { label: 'Admin notified', isDisabled: true },
            { label: 'Learn more' },
        ],
    },
    {
        name: 'admin with no self-serve options falls back to Learn more',
        inputs: { ...baseInput, isAdmin: true },
        expectedCtas: [{ label: 'Learn more' }],
    },
    {
        name: 'admin (AI Agent paywall) can subscribe, no demo',
        inputs: { ...baseInput, isAdmin: true, canSeeSubscribeNow: true },
        expectedCtas: [{ label: 'Subscribe now' }, { label: 'Learn more' }],
    },
    {
        name: 'admin (AI Agent paywall) can subscribe, can book demo',
        inputs: {
            ...baseInput,
            isAdmin: true,
            canSeeSubscribeNow: true,
            canBookDemo: true,
        },
        expectedCtas: [
            { label: 'Subscribe now' },
            { label: 'Book a demo' },
            { label: 'Learn more' },
        ],
    },
    {
        name: 'admin (AI Agent paywall) can trial, no demo',
        inputs: { ...baseInput, isAdmin: true, canSeeTrial: true },
        expectedCtas: [{ label: 'Try for free' }, { label: 'Learn more' }],
    },
    {
        name: 'admin (AI Agent paywall) can trial, can book demo',
        inputs: {
            ...baseInput,
            isAdmin: true,
            canSeeTrial: true,
            canBookDemo: true,
        },
        expectedCtas: [
            { label: 'Try for free' },
            { label: 'Book a demo' },
            { label: 'Learn more' },
        ],
    },
    {
        name: 'admin (Shopping Assistant) can upgrade, no demo, not onboarded: includes Start AI Agent only',
        inputs: {
            ...baseInput,
            isAdmin: true,
            hasAutomate: true,
            canSeeSubscribeNow: true,
        },
        expectedCtas: [
            { label: 'Upgrade now' },
            { label: 'Learn more' },
            { label: 'Start AI Agent only' },
        ],
    },
    {
        name: 'admin (Shopping Assistant) can upgrade, can demo, not onboarded: Learn more dropped for space',
        inputs: {
            ...baseInput,
            isAdmin: true,
            hasAutomate: true,
            canSeeSubscribeNow: true,
            canBookDemo: true,
        },
        expectedCtas: [
            { label: 'Upgrade now' },
            { label: 'Book a demo' },
            { label: 'Start AI Agent only' },
        ],
    },
    {
        name: 'admin (Shopping Assistant) can upgrade, can demo, already onboarded: no Start AI Agent only',
        inputs: {
            ...baseInput,
            isAdmin: true,
            hasAutomate: true,
            canSeeSubscribeNow: true,
            canBookDemo: true,
            isOnboarded: true,
        },
        expectedCtas: [{ label: 'Upgrade now' }, { label: 'Book a demo' }],
    },
    {
        name: 'admin (Shopping Assistant) can trial 14 days, no demo, not onboarded',
        inputs: {
            ...baseInput,
            isAdmin: true,
            hasAutomate: true,
            canSeeTrial: true,
        },
        expectedCtas: [
            { label: 'Try for 14 days' },
            { label: 'Learn more' },
            { label: 'Start AI Agent only' },
        ],
        // V3 §5 (CRMGROW-3797): cohort collapses to a single "Set Up AI Agent"
        // CTA that routes through the wizard. Trial opt-in is re-offered via
        // TrialOptInBanner → TrialActivationModal post-wizard.
        v3ExpectedCtas: [{ label: 'Set Up AI Agent' }],
    },
    {
        name: 'admin (Shopping Assistant) can trial 14 days, can demo, not onboarded: Learn more dropped',
        inputs: {
            ...baseInput,
            isAdmin: true,
            hasAutomate: true,
            canSeeTrial: true,
            canBookDemo: true,
        },
        expectedCtas: [
            { label: 'Try for 14 days' },
            { label: 'Book a demo' },
            { label: 'Start AI Agent only' },
        ],
        // V3 §5 (CRMGROW-3797): same single-CTA collapse as above.
        v3ExpectedCtas: [{ label: 'Set Up AI Agent' }],
    },
]
