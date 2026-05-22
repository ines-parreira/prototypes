import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    TrialEventType,
    TrialType,
} from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { logInTrialEventFromPaywall } from 'pages/aiAgent/components/ShoppingAssistant/utils/eventLogger'
import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

import type { AiAgentCtasParams } from './useAiAgentPaywallCta'
import { useAiAgentCtas } from './useAiAgentPaywallCta'

jest.mock(
    'pages/aiAgent/components/ShoppingAssistant/utils/eventLogger',
    () => ({
        logInTrialEventFromPaywall: jest.fn(),
    }),
)

const mockLogInTrialEventFromPaywall =
    logInTrialEventFromPaywall as jest.MockedFunction<
        typeof logInTrialEventFromPaywall
    >

const baseInputs = {
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

const buildParams = (
    overrides: Partial<AiAgentCtasParams>,
): AiAgentCtasParams => ({
    ...baseInputs,
    isDuringOrAfterTrial: false,
    learnMoreUrl: EXTERNAL_URLS.AI_AGENT_TRIAL_LEARN_MORE_PAYWALL,
    onOpenWizard: jest.fn(),
    onOpenSubscribeModal: jest.fn(),
    onOpenTrialRequestModal: jest.fn(),
    onOpenUpgradePlanModal: jest.fn(),
    onCloseTrialRequestModal: jest.fn(),
    onCloseTrialFinishSetupModal: jest.fn(),
    trialModals: {
        isTrialRequestModalOpen: false,
        trialRequestModal:
            {} as AiAgentCtasParams['trialModals']['trialRequestModal'],
        isTrialFinishSetupModalOpen: false,
        trialFinishSetupModal:
            {} as AiAgentCtasParams['trialModals']['trialFinishSetupModal'],
    },
    ...overrides,
})

const Harness = ({ params }: { params: AiAgentCtasParams }) => {
    const { ctas } = useAiAgentCtas(params)
    return <>{ctas}</>
}

const renderCtas = (params: AiAgentCtasParams) =>
    render(<Harness params={params} />)

describe('useAiAgentCtas (V3) — §5 paywall behavior', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('cohort #10 (admin · AI Agent paywall · trial · no demo)', () => {
        it('routes "Try for free" to the wizard (not the trial-upgrade modal)', async () => {
            const user = userEvent.setup()
            const onOpenWizard = jest.fn()
            const params = buildParams({
                isAdmin: true,
                canSeeTrial: true,
                onOpenWizard,
            })

            renderCtas(params)

            await user.click(
                screen.getByRole('button', { name: /Try for free/i }),
            )

            expect(onOpenWizard).toHaveBeenCalledTimes(1)
        })

        it('still fires the StartTrial intent event when "Try for free" is clicked', async () => {
            const user = userEvent.setup()
            renderCtas(
                buildParams({
                    isAdmin: true,
                    canSeeTrial: true,
                }),
            )

            await user.click(
                screen.getByRole('button', { name: /Try for free/i }),
            )

            expect(mockLogInTrialEventFromPaywall).toHaveBeenCalledWith(
                TrialEventType.StartTrial,
                TrialType.AiAgent,
            )
        })
    })

    describe('cohort #15 (admin · Shopping Assistant · trial · no demo · not onboarded)', () => {
        const cohort15Params = buildParams({
            isAdmin: true,
            hasAutomate: true,
            canSeeTrial: true,
        })

        it('collapses to a single "Set Up AI Agent" CTA', () => {
            renderCtas(cohort15Params)

            expect(
                screen.getByRole('button', { name: /Set Up AI Agent/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /Try for 14 days/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', {
                    name: /Start AI Agent only/i,
                }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /Learn more/i }),
            ).not.toBeInTheDocument()
        })

        it('routes the single CTA to the wizard', async () => {
            const user = userEvent.setup()
            const onOpenWizard = jest.fn()
            renderCtas({ ...cohort15Params, onOpenWizard })

            await user.click(
                screen.getByRole('button', { name: /Set Up AI Agent/i }),
            )

            expect(onOpenWizard).toHaveBeenCalledTimes(1)
        })

        it('does not fire StartTrial intent event when the wizard CTA is clicked', async () => {
            const user = userEvent.setup()
            renderCtas(cohort15Params)

            await user.click(
                screen.getByRole('button', { name: /Set Up AI Agent/i }),
            )

            expect(mockLogInTrialEventFromPaywall).not.toHaveBeenCalled()
        })
    })

    describe('cohort #16 (admin · Shopping Assistant · trial · can book demo · not onboarded)', () => {
        it('collapses to a single "Set Up AI Agent" CTA even with canBookDemo=true', () => {
            renderCtas(
                buildParams({
                    isAdmin: true,
                    hasAutomate: true,
                    canSeeTrial: true,
                    canBookDemo: true,
                }),
            )

            expect(
                screen.getByRole('button', { name: /Set Up AI Agent/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /Try for 14 days/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /Book a demo/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', {
                    name: /Start AI Agent only/i,
                }),
            ).not.toBeInTheDocument()
        })
    })

    describe('regression guard — onboarded variants do NOT collapse', () => {
        it('renders the V2-compatible Upgrade stack when hasAutomate + canSeeSubscribeNow (cohort #14)', () => {
            renderCtas(
                buildParams({
                    isAdmin: true,
                    hasAutomate: true,
                    canSeeSubscribeNow: true,
                    isOnboarded: true,
                    canBookDemo: true,
                }),
            )

            expect(
                screen.getByRole('button', { name: /Upgrade now/i }),
            ).toBeInTheDocument()
            // §5 single-CTA collapse should NOT apply (canSeeTrial=false).
            expect(
                screen.queryByRole('button', { name: /Set Up AI Agent/i }),
            ).not.toBeInTheDocument()
        })

        it('renders the V2-compatible trial stack when isOnboarded=true (no §5 collapse)', () => {
            renderCtas(
                buildParams({
                    isAdmin: true,
                    hasAutomate: true,
                    canSeeTrial: true,
                    isOnboarded: true,
                }),
            )

            // isOnboarded=true bypasses the §5 collapse and the
            // StartAIAgentAction (which itself requires !isOnboarded).
            expect(
                screen.queryByRole('button', { name: /Set Up AI Agent/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Try for 14 days/i }),
            ).toBeInTheDocument()
        })
    })
})
