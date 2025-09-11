import { toPercentage } from 'pages/aiAgent/trial/utils/utils'

type DescriptionCondition = {
    isAiAgentTrial: boolean
    isMultiStore: boolean
    hasSignificantAutomationRateImpact: boolean
    hasSignificantGmvImpact: boolean
    hasCurrentStoreOptedOut: boolean
}

type DescriptionRule = {
    condition: () => boolean
    output: () => React.ReactNode
}

type DescriptionProps = {
    automationRate: number
    gmvInfluencedRate: number
    gmvInfluenced: string
} & DescriptionCondition

export const getTrialEndingModalDescription = ({
    automationRate,
    gmvInfluencedRate,
    gmvInfluenced,
    isAiAgentTrial,
    isMultiStore,
    hasSignificantAutomationRateImpact,
    hasSignificantGmvImpact,
    hasCurrentStoreOptedOut,
}: DescriptionProps) => {
    const aiAgentImpactText = (
        <>
            AI Agent handled{' '}
            <strong>
                {toPercentage(automationRate)} of customer inquiries
            </strong>{' '}
            and automatically{' '}
            <strong>
                drove a {toPercentage(gmvInfluencedRate)} lift in revenue
            </strong>{' '}
            in the last 13 days.
        </>
    )

    const aiAgentNonImpactText = (
        <>
            AI Agent has been working behind the scenes to help your team{' '}
            <strong>deliver faster, more efficient support and sales</strong>.
        </>
    )

    const rules: DescriptionRule[] = [
        // AI Agent trial type logic  starts here
        // - has significant impact
        // -- multi-store
        // --- opted-out
        {
            condition: () =>
                isAiAgentTrial &&
                hasSignificantAutomationRateImpact &&
                isMultiStore &&
                hasCurrentStoreOptedOut,
            output: () => (
                <span>
                    {aiAgentImpactText} To keep the momentum going, upgrade your
                    plan today for continuous access to AI Agent across all your
                    stores.
                </span>
            ),
        },
        // --- opted-in
        {
            condition: () =>
                isAiAgentTrial &&
                hasSignificantAutomationRateImpact &&
                isMultiStore &&
                !hasCurrentStoreOptedOut,
            output: () => (
                <span>
                    {aiAgentImpactText} To keep the momentum going, your plan
                    will be upgraded automatically tomorrow – giving you
                    continued access to AI Agent across all your stores.
                </span>
            ),
        },
        // -- single-store
        // --- opted-out
        {
            condition: () =>
                isAiAgentTrial &&
                hasSignificantAutomationRateImpact &&
                !isMultiStore &&
                hasCurrentStoreOptedOut,
            output: () => (
                <span>
                    {aiAgentImpactText} To keep the momentum going, upgrade your
                    plan today for continuous access to AI Agent.
                </span>
            ),
        },
        // --- opted-in
        {
            condition: () =>
                isAiAgentTrial &&
                hasSignificantAutomationRateImpact &&
                !isMultiStore &&
                !hasCurrentStoreOptedOut,
            output: () => (
                <span>
                    {aiAgentImpactText} To keep the momentum going, your plan
                    will be upgraded automatically tomorrow.
                </span>
            ),
        },
        // - doesn't have significant impact
        // -- multi-store
        // --- opted-out
        {
            condition: () =>
                isAiAgentTrial &&
                !hasSignificantAutomationRateImpact &&
                isMultiStore &&
                hasCurrentStoreOptedOut,
            output: () => (
                <span>
                    {aiAgentNonImpactText} To keep the momentum going, upgrade
                    your plan today for continuous access to AI Agent across all
                    your stores.
                </span>
            ),
        },
        // --- opted-in
        {
            condition: () =>
                isAiAgentTrial &&
                !hasSignificantAutomationRateImpact &&
                isMultiStore &&
                !hasCurrentStoreOptedOut,
            output: () => (
                <span>
                    {aiAgentNonImpactText} To keep the momentum going, your plan
                    will be upgraded automatically tomorrow – giving you
                    continued access to AI Agent across all your stores.
                </span>
            ),
        },
        // -- single-store
        // --- opted-out
        {
            condition: () =>
                isAiAgentTrial &&
                !hasSignificantAutomationRateImpact &&
                !isMultiStore &&
                hasCurrentStoreOptedOut,
            output: () => (
                <span>
                    {aiAgentNonImpactText} To keep the momentum going, upgrade
                    your plan today for continuous access to AI Agent.
                </span>
            ),
        },
        // --- opted-in
        {
            condition: () =>
                isAiAgentTrial &&
                !hasSignificantAutomationRateImpact &&
                !isMultiStore &&
                !hasCurrentStoreOptedOut,
            output: () => (
                <span>
                    {aiAgentNonImpactText} To keep the momentum going, your plan
                    will be upgraded automatically tomorrow.
                </span>
            ),
        },

        // Shopping Assistant trial type logic starts here
        {
            condition: () => !isAiAgentTrial && hasSignificantGmvImpact,
            output: () => (
                <span>
                    Shopping Assistant drove <strong>{gmvInfluenced}</strong>{' '}
                    uplift in GMV. To keep the momentum going, you will be
                    upgraded automatically tomorrow (unless you&apos;ve
                    opted-out).
                </span>
            ),
        },
        {
            condition: () => !isAiAgentTrial && !hasSignificantGmvImpact,
            output: () => (
                <span>
                    Brands that unlock Shopping Assistant see ongoing
                    performance improvements over time, leading to stronger
                    results. To keep the momentum going, you will be upgraded
                    automatically tomorrow (unless you&apos;ve opted-out).
                </span>
            ),
        },
    ]

    for (const rule of rules) {
        if (rule.condition()) {
            return rule.output()
        }
    }

    return <></>
}

type SecondaryDescriptionCondition = {
    isAiAgentTrial: boolean
    hasSignificantAutomationRateImpact: boolean
    hasSignificantGmvImpact: boolean
    hasPriceIncrease: boolean
    isAdminUser: boolean
}

type SecondaryDescriptionRule = {
    condition: () => boolean
    output: () => string
}

type SecondaryDescriptionProps = {
    increaseAmount: string
    cadence: string
    typicalResultsText: string
} & SecondaryDescriptionCondition

export const getTrialEndingModalSecondaryDescription = ({
    increaseAmount,
    cadence,
    typicalResultsText,
    isAiAgentTrial,
    hasSignificantAutomationRateImpact,
    hasSignificantGmvImpact,
    hasPriceIncrease,
    isAdminUser,
}: SecondaryDescriptionProps) => {
    const rules: SecondaryDescriptionRule[] = [
        {
            condition: () =>
                (isAiAgentTrial &&
                    hasSignificantAutomationRateImpact &&
                    !isAdminUser) ||
                (isAiAgentTrial &&
                    !hasSignificantAutomationRateImpact &&
                    !isAdminUser) ||
                (!isAiAgentTrial && hasSignificantGmvImpact && !isAdminUser) ||
                (!isAiAgentTrial && !hasSignificantGmvImpact && !isAdminUser),
            output: () => typicalResultsText,
        },

        {
            condition: () =>
                (isAiAgentTrial &&
                    hasSignificantAutomationRateImpact &&
                    isAdminUser) ||
                (!isAiAgentTrial &&
                    hasSignificantGmvImpact &&
                    isAdminUser &&
                    hasPriceIncrease),
            output: () =>
                `With the upgrade, your plan will increase by ${increaseAmount}/${cadence}.`,
        },

        {
            condition: () =>
                (isAiAgentTrial &&
                    !hasSignificantAutomationRateImpact &&
                    isAdminUser) ||
                (!isAiAgentTrial &&
                    !hasSignificantGmvImpact &&
                    isAdminUser &&
                    hasPriceIncrease),
            output: () =>
                `${typicalResultsText} After upgrading, your plan will increase by ${increaseAmount}/${cadence}.`,
        },

        {
            condition: () =>
                !isAiAgentTrial &&
                hasSignificantGmvImpact &&
                isAdminUser &&
                !hasPriceIncrease,
            output: () =>
                'With the upgrade, the price of your plan remains the same.',
        },

        {
            condition: () =>
                !isAiAgentTrial &&
                !hasSignificantGmvImpact &&
                isAdminUser &&
                !hasPriceIncrease,
            output: () =>
                `${typicalResultsText} The price of your plan remains the same after the upgrade.`,
        },
    ]

    for (const rule of rules) {
        if (rule.condition()) {
            return rule.output()
        }
    }

    return typicalResultsText
}
