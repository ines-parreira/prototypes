import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import type { WizardSkill } from 'pages/aiAgent/skills/hooks/useEnrichedSkillWizard'
import { SkillWizardSkillStatus } from 'pages/aiAgent/skills/types'
import { useApps } from 'pages/automate/actionsPlatform/hooks/useApps'

import { SkillReviewStep } from './SkillReviewStep'
import { SkillWizardContext } from './SkillWizardContext'
import type { SkillWizardContextValue } from './SkillWizardContext'

jest.mock('pages/aiAgent/components/GuidanceEditor/GuidanceEditor', () => ({
    GuidanceEditor: ({ content }: { content: string }) => (
        <div data-stub="guidance-editor">Editor with content: {content}</div>
    ),
}))
jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
)
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')

const mockUseGuidancesAvailableActions =
    useGetGuidancesAvailableActions as jest.MockedFunction<
        typeof useGetGuidancesAvailableActions
    >
const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.MockedFunction<
        typeof useAiAgentStoreConfigurationContext
    >
const mockUseApps = useApps as jest.MockedFunction<typeof useApps>

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

const shopifyApp = {
    id: 'shopify',
    type: 'shopify' as const,
    name: 'Shopify',
    icon: 'shopify.png',
}

const buildSkill = (overrides: Partial<WizardSkill> = {}): WizardSkill => ({
    skill_id: 1,
    article: {
        id: 11,
        translation: {
            title: 'Returns and exchanges',
            content: '<p>Initial instructions</p>',
            intents: ['Return / Request', 'Return / Status'],
        },
    } as unknown as WizardSkill['article'],
    guidance_ids: [101, 102, 103, 104, 105],
    recommendation: 'Automate refund requests.',
    estimated_automation_rate_impact: '+6%',
    action_configuration_ids: ['1', '2'],
    ...overrides,
})

const wizardContextValue: SkillWizardContextValue = {
    currentStep: 1,
    totalSteps: 3,
    reviewStepsCount: 2,
    isFirstStep: false,
    isLastStep: false,
    isRecapStep: false,
    goNext: jest.fn(),
    goBack: jest.fn(),
    goToStep: jest.fn(),
    onTest: jest.fn(),
}

type RenderOptions = {
    skill?: WizardSkill
    status?: SkillWizardSkillStatus
    onStatusChange?: (status: SkillWizardSkillStatus) => void
    onInstructionsChange?: (content: string) => void
    contextOverrides?: Partial<SkillWizardContextValue>
}

const renderStep = ({
    skill = buildSkill(),
    status = SkillWizardSkillStatus.Approved,
    onStatusChange = jest.fn(),
    onInstructionsChange,
    contextOverrides,
}: RenderOptions = {}) =>
    render(
        <ThemeProvider>
            <SkillWizardContext.Provider
                value={{ ...wizardContextValue, ...contextOverrides }}
            >
                <SkillReviewStep
                    skill={skill}
                    status={status}
                    onStatusChange={onStatusChange}
                    onInstructionsChange={onInstructionsChange}
                />
            </SkillWizardContext.Provider>
        </ThemeProvider>,
    )

const buildSkillWithEmptyInstructions = () =>
    buildSkill({
        article: {
            id: 11,
            translation: {
                title: 'Returns and exchanges',
                content: '',
                intents: [],
            },
        } as unknown as WizardSkill['article'],
    })

describe('SkillReviewStep', () => {
    beforeEach(() => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: { storeName: 'ekster', shopType: 'shopify' },
        } as ReturnType<typeof useAiAgentStoreConfigurationContext>)

        mockUseApps.mockReturnValue({
            isLoading: false,
            apps: [shopifyApp],
            actionsApps: [],
        } as ReturnType<typeof useApps>)

        mockUseGuidancesAvailableActions.mockReturnValue({
            isLoading: false,
            guidanceActions: [],
            rawActions: [
                { id: '1', name: 'Remove item', apps: [{ type: 'shopify' }] },
                { id: '2', name: 'Replace item', apps: [{ type: 'shopify' }] },
            ] as any,
        })
    })

    it('renders the why card, skill title, intents and grouped action chips', () => {
        renderStep()

        expect(
            screen.getByText('Why we created this skill'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Generated from 5 guidances'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Estimated impact: +6% automation rate'),
        ).toBeInTheDocument()

        expect(screen.getByText('Returns and exchanges')).toBeInTheDocument()
        expect(screen.getByText('Return / Request')).toBeInTheDocument()
        expect(screen.getByText('Return / Status')).toBeInTheDocument()

        expect(screen.getByText('Remove item')).toBeInTheDocument()
        expect(screen.getByText('Replace item')).toBeInTheDocument()
        expect(screen.getByText('and')).toBeInTheDocument()
        expect(screen.getByText('in')).toBeInTheDocument()
        expect(screen.getByText('Shopify')).toBeInTheDocument()
    })

    it('renders both ButtonGroup options', () => {
        renderStep()

        expect(screen.getByText('Looks good')).toBeInTheDocument()
        expect(screen.getByText('Keep as draft')).toBeInTheDocument()
    })

    it('exposes the "keep this skill as a draft for now" link inside the actions section', () => {
        renderStep()

        expect(
            screen.getByRole('button', {
                name: 'keep this skill as a draft for now',
            }),
        ).toBeInTheDocument()
    })

    it('forwards the article content to the editor as initial content', () => {
        renderStep()

        expect(
            screen.getByText(
                'Editor with content: <p>Initial instructions</p>',
            ),
        ).toBeInTheDocument()
    })

    it('falls back to Approved visually when status is undefined', () => {
        renderStep({ status: undefined })

        expect(screen.getByRole('radio', { name: /Looks good/i })).toBeChecked()
    })

    it('reflects a Draft status from props in the toggle', () => {
        renderStep({ status: SkillWizardSkillStatus.Draft })

        expect(
            screen.getByRole('radio', { name: /Keep as draft/i }),
        ).toBeChecked()
    })

    it('disables the Approved option and shows the blocked banner when instructions are empty', () => {
        renderStep({ skill: buildSkillWithEmptyInstructions() })

        expect(
            screen.getByText(
                "We'll save this skill as a draft. You can add instructions later.",
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: /Looks good/i }),
        ).toBeDisabled()
    })

    it('labels the banner CTA "Review next skill" when more review steps remain', () => {
        renderStep({
            skill: buildSkillWithEmptyInstructions(),
            contextOverrides: { currentStep: 1, reviewStepsCount: 2 },
        })

        expect(
            screen.getByRole('button', { name: /^Review next skill/ }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /^Next\b/ }),
        ).not.toBeInTheDocument()
    })

    it('labels the banner CTA "Next" on the last review step', () => {
        renderStep({
            skill: buildSkillWithEmptyInstructions(),
            contextOverrides: { currentStep: 2, reviewStepsCount: 2 },
        })

        expect(
            screen.getByRole('button', { name: /^Next\b/ }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /^Review next skill/ }),
        ).not.toBeInTheDocument()
    })

    it('emits onStatusChange when the user keeps the skill as draft from the body link', async () => {
        const user = userEvent.setup()
        const onStatusChange = jest.fn()
        renderStep({ onStatusChange })

        await user.click(
            screen.getByRole('button', {
                name: 'keep this skill as a draft for now',
            }),
        )

        expect(onStatusChange).toHaveBeenCalledWith(
            SkillWizardSkillStatus.Draft,
        )
    })
})
