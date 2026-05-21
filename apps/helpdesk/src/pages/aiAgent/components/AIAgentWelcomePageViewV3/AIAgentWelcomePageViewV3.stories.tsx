import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { Box } from '@gorgias/axiom'

import type { PaywallCohortFixture } from '../AIAgentWelcomePageView/paywallCohortFixtures'
import { paywallCohortFixtures } from '../AIAgentWelcomePageView/paywallCohortFixtures'

import { PaywallInfo, PaywallPreview } from './AIAgentWelcomePageViewV3'
import type { AiAgentCtasParams } from './useAiAgentPaywallCta'
import { useAiAgentCtas } from './useAiAgentPaywallCta'

const NOOP = () => undefined

const STORY_TRIAL_MODALS: AiAgentCtasParams['trialModals'] = {
    isTrialModalOpen: false,
    newTrialUpgradePlanModal:
        {} as AiAgentCtasParams['trialModals']['newTrialUpgradePlanModal'],
    isTrialRequestModalOpen: false,
    trialRequestModal:
        {} as AiAgentCtasParams['trialModals']['trialRequestModal'],
    isTrialFinishSetupModalOpen: false,
    trialFinishSetupModal:
        {} as AiAgentCtasParams['trialModals']['trialFinishSetupModal'],
}

type PaywallStoryProps = {
    cohort: PaywallCohortFixture
    showJtbdPicker?: boolean
}

const PaywallStory = ({
    cohort,
    showJtbdPicker = false,
}: PaywallStoryProps) => {
    const { ctas } = useAiAgentCtas({
        ...cohort.inputs,
        isDuringOrAfterTrial: false,
        learnMoreUrl: 'https://www.gorgias.com/products/automate',
        onOpenWizard: NOOP,
        onOpenSubscribeModal: NOOP,
        onOpenTrialUpgradeModal: NOOP,
        onOpenTrialRequestModal: NOOP,
        onOpenUpgradePlanModal: NOOP,
        onCloseTrialRequestModal: NOOP,
        onCloseTrialFinishSetupModal: NOOP,
        trialModals: STORY_TRIAL_MODALS,
    })

    const expectedCtaLabels =
        cohort.expectedCtas.length === 0
            ? '(no CTAs)'
            : cohort.expectedCtas.map((c) => c.label).join(' · ')

    return (
        <>
            <Box flexDirection="row" width="100%" height="100vh">
                <PaywallInfo
                    showJtbdPicker={showJtbdPicker}
                    onJtbdSelect={NOOP}
                    ctas={ctas}
                />
                <PaywallPreview />
            </Box>
            <div
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '8px 16px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: 'white',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    lineHeight: 1.5,
                    pointerEvents: 'none',
                    zIndex: 2147483647,
                }}
            >
                <div>
                    <strong>Cohort:</strong> {cohort.name}
                </div>
                <div>
                    <strong>Expected:</strong> {expectedCtaLabels}
                </div>
            </div>
        </>
    )
}

const meta = {
    title: 'AI Agent/Welcome Page V3/Paywall',
    component: PaywallStory,
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof PaywallStory>

export default meta
type Story = StoryObj<typeof meta>

const findCohort = (nameContains: string): PaywallCohortFixture => {
    const matches = paywallCohortFixtures.filter((fixture) =>
        fixture.name.includes(nameContains),
    )
    if (matches.length !== 1) {
        throw new Error(
            `Expected exactly one paywall cohort matching "${nameContains}", found ${matches.length}`,
        )
    }
    return matches[0]
}

const cohortStory = (storyLabel: string, nameContains: string): Story => ({
    name: storyLabel,
    args: { cohort: findCohort(nameContains) },
})

export const NewInstall: Story = cohortStory(
    'New install · setup',
    'canStartOnboarding wins regardless of admin',
)
export const UpdatingWizard: Story = cohortStory(
    'Updating wizard · continue',
    'canStartOnboarding while updating wizard',
)
export const NonAdminNoNotify: Story = cohortStory(
    'Non-admin · cannot notify · nothing',
    'non-admin without notify capability',
)
export const NonAdminCanNotify: Story = cohortStory(
    'Non-admin · notify + learn more',
    'non-admin can notify, no demo',
)
export const NonAdminNotifyAndDemo: Story = cohortStory(
    'Non-admin · notify + demo + learn more',
    'non-admin can notify, can book demo',
)
export const NonAdminAlreadyNotified: Story = cohortStory(
    'Non-admin · already notified (disabled)',
    'non-admin who already notified',
)
export const AdminLearnMoreFallback: Story = cohortStory(
    'Admin · no self-serve · learn more only',
    'admin with no self-serve options',
)
export const AdminAiAgentSubscribe: Story = cohortStory(
    'Admin · AI Agent · subscribe',
    'admin (AI Agent paywall) can subscribe, no demo',
)
export const AdminAiAgentSubscribeAndDemo: Story = cohortStory(
    'Admin · AI Agent · subscribe + demo',
    'admin (AI Agent paywall) can subscribe, can book demo',
)
export const AdminAiAgentTrial: Story = cohortStory(
    'Admin · AI Agent · trial',
    'admin (AI Agent paywall) can trial, no demo',
)
export const AdminAiAgentTrialAndDemo: Story = cohortStory(
    'Admin · AI Agent · trial + demo',
    'admin (AI Agent paywall) can trial, can book demo',
)
export const AdminSaUpgradeStartAi: Story = cohortStory(
    'Admin · Shopping Asst · upgrade + start AI',
    'admin (Shopping Assistant) can upgrade, no demo, not onboarded',
)
export const AdminSaUpgradeWithDemo: Story = cohortStory(
    'Admin · Shopping Asst · upgrade + demo',
    'admin (Shopping Assistant) can upgrade, can demo, not onboarded',
)
export const AdminSaUpgradeOnboarded: Story = cohortStory(
    'Admin · Shopping Asst · upgrade + demo (onboarded)',
    'admin (Shopping Assistant) can upgrade, can demo, already onboarded',
)
export const AdminSaTrial: Story = cohortStory(
    'Admin · Shopping Asst · trial',
    'admin (Shopping Assistant) can trial 14 days, no demo',
)
export const AdminSaTrialWithDemo: Story = cohortStory(
    'Admin · Shopping Asst · trial + demo',
    'admin (Shopping Assistant) can trial 14 days, can demo',
)

export const JtbdPickerOpen: Story = {
    name: 'JTBD picker (new install + picker open)',
    args: {
        cohort: findCohort('canStartOnboarding wins regardless of admin'),
        showJtbdPicker: true,
    },
}
