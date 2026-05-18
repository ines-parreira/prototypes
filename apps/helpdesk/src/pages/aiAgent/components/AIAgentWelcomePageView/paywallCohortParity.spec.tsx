/**
 * Fixture-driven parity spec.
 *
 * Locks the cohort → expected-CTAs decision matrix for V2's `useAiAgentCtas`.
 * The same `paywallCohortFixtures` table will drive the V3 paywall once it
 * widens beyond `canStartOnboarding`, so any drift between V2 and V3 surfaces
 * here as a failing assertion.
 *
 * The deeper hook behaviors (click handlers, analytics events, modal props)
 * remain covered by `useAiAgentPaywallCTA.spec.ts`. This spec asserts only
 * the visible CTA shape so V3 can match it without coupling to internals.
 */

import { render } from '@repo/testing'

import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

import type { AiAgentCtasParams } from '../ShoppingAssistant/hooks/useAiAgentPaywallCTA'
import { useAiAgentCtas } from '../ShoppingAssistant/hooks/useAiAgentPaywallCTA'

import type {
    PaywallCohortFixture,
    PaywallCohortInput,
} from './paywallCohortFixtures'
import { paywallCohortFixtures } from './paywallCohortFixtures'

const KNOWN_CTA_LABELS = [
    'Set Up AI Agent',
    'Continue Setup',
    'Subscribe now',
    'Upgrade now',
    'Try for free',
    'Try for 14 days',
    'Notify admin',
    'Admin notified',
    'Learn more',
    'Start AI Agent only',
    'Book a demo',
] as const

// Match by substring because LegacyButton's `leadingIcon` injects icon text
// (e.g. "notifications_none") into the button's textContent.
const findKnownLabelIn = (text: string): string | null =>
    KNOWN_CTA_LABELS.find((label) => text.includes(label)) ?? null

const buildV2Params = (inputs: PaywallCohortInput): AiAgentCtasParams => ({
    ...inputs,
    isDuringOrAfterTrial: false,
    learnMoreUrl: EXTERNAL_URLS.AI_AGENT_TRIAL_LEARN_MORE_PAYWALL,
    onOpenWizard: jest.fn(),
    onOpenSubscribeModal: jest.fn(),
    onOpenTrialUpgradeModal: jest.fn(),
    onOpenTrialRequestModal: jest.fn(),
    onOpenUpgradePlanModal: jest.fn(),
    onCloseTrialRequestModal: jest.fn(),
    onCloseTrialFinishSetupModal: jest.fn(),
    trialModals: {
        isTrialModalOpen: false,
        newTrialUpgradePlanModal: {},
        isTrialRequestModalOpen: false,
        trialRequestModal: {},
        isTrialFinishSetupModalOpen: false,
        trialFinishSetupModal: {},
    },
})

type HarnessProps = { inputs: PaywallCohortInput }

const V2CohortHarness = ({ inputs }: HarnessProps) => {
    const { ctas, afterCtas } = useAiAgentCtas(buildV2Params(inputs))
    return (
        <>
            {ctas}
            {afterCtas}
        </>
    )
}

const collectRenderedCtaLabels = (container: HTMLElement): string[] => {
    const clickables = Array.from(container.querySelectorAll('button, a'))
    const labels: string[] = []
    for (const el of clickables) {
        const label = findKnownLabelIn(el.textContent ?? '')
        if (label) labels.push(label)
    }
    return labels
}

const findCtaElement = (
    container: HTMLElement,
    label: string,
): HTMLElement | null => {
    const clickables = Array.from(container.querySelectorAll('button, a'))
    return (
        (clickables.find((el) =>
            (el.textContent ?? '').includes(label),
        ) as HTMLElement) ?? null
    )
}

describe('paywall cohort parity (V2)', () => {
    it.each<PaywallCohortFixture>(paywallCohortFixtures)(
        'V2 renders expected CTAs for: $name',
        ({ inputs, expectedCtas }) => {
            const { container } = render(<V2CohortHarness inputs={inputs} />)

            const renderedLabels = collectRenderedCtaLabels(container)
            const expectedLabels = expectedCtas.map((cta) => cta.label)
            expect(renderedLabels).toEqual(expectedLabels)

            for (const cta of expectedCtas) {
                if (cta.isDisabled === undefined) continue

                const ctaElement = findCtaElement(container, cta.label)
                const buttonAncestor = ctaElement?.closest('button')
                // LegacyButton reflects disabled via `aria-disabled`, so we
                // accept either the native attribute or the ARIA equivalent.
                const isRenderedDisabled =
                    buttonAncestor?.hasAttribute('disabled') === true ||
                    buttonAncestor?.getAttribute('aria-disabled') === 'true'
                expect(isRenderedDisabled).toBe(cta.isDisabled)
            }
        },
    )
})
