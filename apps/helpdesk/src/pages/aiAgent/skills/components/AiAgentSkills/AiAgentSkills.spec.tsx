import { useFlag } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { ThemeProvider } from 'core/theme'
import { useGetWizard } from 'models/helpCenter/queries'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { useEnrichedSkillWizard } from 'pages/aiAgent/skills/hooks/useEnrichedSkillWizard'
import type { EnrichedSkillWizard } from 'pages/aiAgent/skills/hooks/useEnrichedSkillWizard'
import { useHasLinkedSkills } from 'pages/aiAgent/skills/hooks/useHasLinkedSkills'
import { useSkillsTemplates } from 'pages/aiAgent/skills/hooks/useSkillsTemplates'
import { IntentStatus, SkillWizardStatus } from 'pages/aiAgent/skills/types'
import type { Intent } from 'pages/aiAgent/skills/types'

import { AiAgentSkills } from './AiAgentSkills'

const mockPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockPush }),
}))
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('pages/aiAgent/skills/hooks/useHasLinkedSkills')
jest.mock('pages/aiAgent/skills/hooks/useSkillsTemplates')
jest.mock('pages/aiAgent/skills/hooks/useEnrichedSkillWizard')
jest.mock('models/helpCenter/queries', () => ({
    useGetWizard: jest.fn(),
}))
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const mockUseAiAgentNavigation = useAiAgentNavigation as jest.MockedFunction<
    typeof useAiAgentNavigation
>
const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.MockedFunction<
        typeof useAiAgentStoreConfigurationContext
    >
jest.mock('../SkillsTable/SkillsTable', () => ({
    SkillsTable: () => (
        <div role="region" aria-label="Skills Table">
            Skills Table
        </div>
    ),
}))
jest.mock('../IntentsTable/IntentsTable', () => ({
    IntentsTable: ({
        isOpen,
        onOpenChange,
    }: {
        isOpen: boolean
        onOpenChange: (open: boolean) => void
    }) =>
        isOpen ? (
            <div role="region" aria-label="Intents Table">
                Intents Table
                <button onClick={() => onOpenChange(false)}>Close</button>
            </div>
        ) : null,
}))
jest.mock(
    'pages/aiAgent/skills/components/RecommendedSkillsSection/RecommendedSkillsSection',
    () => ({
        RecommendedSkillsSection: ({
            skillsTemplates,
        }: {
            skillsTemplates: unknown[]
        }) => (
            <div>Recommended Skills ({skillsTemplates.length} templates)</div>
        ),
    }),
)
jest.mock(
    'pages/aiAgent/skills/components/ReviewSkillsSection/ReviewSkillsSection',
    () => ({
        ReviewSkillsSection: ({ onCTA }: { onCTA: () => void }) => (
            <div role="region" aria-label="Review Skills">
                Review Skills
                <button onClick={onCTA}>Review CTA</button>
            </div>
        ),
    }),
)
jest.mock(
    'pages/aiAgent/skills/components/SkillsTemplateModal/SkillsTemplateModal',
    () => ({
        SkillsTemplateModal: ({
            onCreateSkillsFromTemplate,
        }: {
            onCreateSkillsFromTemplate: (templateId: string) => void
        }) => (
            <button
                onClick={() => onCreateSkillsFromTemplate('order-status')}
                aria-label="Use template"
            >
                Use template
            </button>
        ),
    }),
)
jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: () => null,
}))
jest.mock(
    'pages/aiAgent/skills/components/IntroducingSkillsBanner/IntroducingSkillsBanner',
    () => ({
        IntroducingSkillsBanner: ({ shopName }: { shopName: string }) => (
            <div aria-label={`Introducing Skills Banner for ${shopName}`}>
                Introducing Skills Banner
            </div>
        ),
    }),
)
jest.mock(
    'pages/aiAgent/skills/components/WizardSkillsBanner/WizardSkillsBanner',
    () => ({
        WizardSkillsBanner: () => (
            <div role="region" aria-label="Wizard Skills Banner">
                Wizard Skills Banner
            </div>
        ),
    }),
)

const mockStore = configureMockStore([thunk])
const mockUseHasLinkedSkills = useHasLinkedSkills as jest.MockedFunction<
    typeof useHasLinkedSkills
>
const mockUseSkillsTemplates = useSkillsTemplates as jest.MockedFunction<
    typeof useSkillsTemplates
>
const mockUseSkillWizard = useEnrichedSkillWizard as jest.MockedFunction<
    typeof useEnrichedSkillWizard
>
const mockUseGetWizard = useGetWizard as jest.MockedFunction<
    typeof useGetWizard
>
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

const baseEnrichedWizard: EnrichedSkillWizard = {
    id: 1,
    account_id: 6069,
    shop_integration_id: 7,
    help_center_id: 21,
    gaia_payload: {
        analysis_period: {
            start: '2026-03-01T00:00:00.000Z',
            end: '2026-04-27T23:59:59.000Z',
            total_tickets: 0,
        },
        recommendations: [],
    },
    state: {},
    status: SkillWizardStatus.NotStarted,
    started_datetime: null,
    completed_datetime: null,
    last_nudge_sent_datetime: null,
    created_datetime: '2026-04-28T10:15:00.000Z',
    updated_datetime: '2026-04-28T10:15:00.000Z',
    all_skills: [],
    reviewable_skills: [],
    ui_wizard_state: { total_count: 0, current_step: 1 },
}

const mockSkillTemplate = {
    id: 'order-status',
    name: 'Order status',
    guidanceId: 'order-status-guidance',
    guidance: undefined,
    intents: [
        {
            name: 'order::status' as Intent['name'],
            status: IntentStatus.NotLinked,
            help_center_id: 0,
            articles: [] as Intent['articles'],
        },
    ],
}
describe('AiAgentSkills', () => {
    let __store: ReturnType<typeof mockStore>
    beforeEach(() => {
        jest.clearAllMocks()
        __store = mockStore({
            ui: {
                stats: {
                    drillDown: {
                        isOpen: false,
                        currentPage: 1,
                    },
                },
            },
        })
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: { storeName: 'test-shop' },
        } as ReturnType<typeof useAiAgentStoreConfigurationContext>)
        mockUseAiAgentNavigation.mockReturnValue({
            navigationItems: [],
            routes: {
                skills: '/app/ai-agent/shopify/test-shop/skills',
                newSkill: '/app/ai-agent/shopify/test-shop/skills/new',
                newSkillFromTemplate: (templateId: string) =>
                    `/app/ai-agent/shopify/test-shop/skills/new?template=${templateId}`,
                skillDetail: (skillId: number) =>
                    `/app/ai-agent/shopify/test-shop/skills/${skillId}`,
                skillsWizard: '/app/ai-agent/shopify/test-shop/skills/wizard',
                skillsWizardStep: (step: number) =>
                    `/app/ai-agent/shopify/test-shop/skills/wizard?step=${step}`,
            } as ReturnType<typeof useAiAgentNavigation>['routes'],
        })
        mockUseSkillsTemplates.mockReturnValue({
            allSkillsTemplates: [mockSkillTemplate],
            availableSkillsTemplates: [mockSkillTemplate],
        })
        mockUseHasLinkedSkills.mockReturnValue({
            hasSkills: false,
            isLoading: false,
            isError: false,
        })
        mockUseFlag.mockReturnValue(false)
        mockUseSkillWizard.mockReturnValue({
            wizard: baseEnrichedWizard,
            guidanceActions: [],
            isLoading: false,
            isError: false,
        })
        mockUseGetWizard.mockReturnValue({
            data: undefined,
        } as unknown as ReturnType<typeof useGetWizard>)
    })
    const renderComponent = () => {
        return render(
            <ThemeProvider>
                <AiAgentSkills />
            </ThemeProvider>,
            {},
        )
    }

    it('should render IntroducingSkillsBanner', () => {
        renderComponent()

        expect(
            screen.getByText('Introducing Skills Banner'),
        ).toBeInTheDocument()
    })

    it('should show empty state when there are no linked skills', () => {
        renderComponent()
        expect(
            screen.getByRole('heading', { name: 'Skills' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('heading', { name: 'No skills yet' }),
        ).toBeInTheDocument()
    })
    it('should show skills table when there are linked skills', () => {
        mockUseHasLinkedSkills.mockReturnValue({
            hasSkills: true,
            isLoading: false,
            isError: false,
        })
        renderComponent()
        expect(
            screen.getByRole('heading', { name: 'Skills' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('region', { name: 'Skills Table' }),
        ).toBeInTheDocument()
    })
    it('should show loading state', () => {
        mockUseHasLinkedSkills.mockReturnValue({
            hasSkills: false,
            isLoading: true,
            isError: false,
        })
        renderComponent()
        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })
    it('should show RecommendedSkillsSection when skill templates are available', () => {
        renderComponent()
        expect(
            screen.getByText('Recommended Skills (1 templates)'),
        ).toBeInTheDocument()
    })
    it('should not show RecommendedSkillsSection when no skill templates are available', () => {
        mockUseSkillsTemplates.mockReturnValue({
            allSkillsTemplates: [],
            availableSkillsTemplates: [],
        })
        renderComponent()
        expect(screen.queryByText(/Recommended Skills/)).not.toBeInTheDocument()
    })
    describe('Navigation', () => {
        it('should navigate to new skill with template when creating from template', async () => {
            const user = userEvent.setup()
            renderComponent()
            await user.click(
                screen.getByRole('button', { name: /use template/i }),
            )
            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-agent/shopify/test-shop/skills/new?template=order-status',
            )
        })
    })
    describe('Intents Table', () => {
        beforeEach(() => {
            mockUseHasLinkedSkills.mockReturnValue({
                hasSkills: true,
                isLoading: false,
                isError: false,
            })
        })
        it('should render intents table closed by default', () => {
            renderComponent()
            expect(
                screen.queryByRole('region', { name: 'Intents Table' }),
            ).not.toBeInTheDocument()
        })
        it('should open intents table when "View intents" is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()
            await user.click(
                screen.getByRole('button', { name: /view intents/i }),
            )
            await waitFor(() => {
                expect(
                    screen.getByRole('region', { name: 'Intents Table' }),
                ).toBeInTheDocument()
            })
        })
        it('should close intents table when close button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()
            await user.click(
                screen.getByRole('button', { name: /view intents/i }),
            )
            await waitFor(() => {
                expect(
                    screen.getByRole('region', { name: 'Intents Table' }),
                ).toBeInTheDocument()
            })
            await user.click(screen.getByRole('button', { name: /close/i }))
            await waitFor(() => {
                expect(
                    screen.queryByRole('region', { name: 'Intents Table' }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('Wizard mode', () => {
        const enableWizardMode = (
            overrides: Partial<EnrichedSkillWizard> = {},
        ) => {
            mockUseFlag.mockReturnValue(true)
            const wizard = { ...baseEnrichedWizard, ...overrides }
            mockUseSkillWizard.mockReturnValue({
                wizard,
                guidanceActions: [],
                isLoading: false,
                isError: false,
            })
            mockUseGetWizard.mockReturnValue({
                data: wizard,
            } as unknown as ReturnType<typeof useGetWizard>)
        }

        it('renders ReviewSkillsSection when the wizard is not_started', () => {
            enableWizardMode({ status: SkillWizardStatus.NotStarted })
            renderComponent()

            expect(
                screen.getByRole('region', { name: 'Review Skills' }),
            ).toBeInTheDocument()
        })

        it('swaps the IntroducingSkillsBanner for the WizardSkillsBanner', () => {
            enableWizardMode({ status: SkillWizardStatus.InProgress })
            renderComponent()

            expect(
                screen.getByRole('region', { name: 'Wizard Skills Banner' }),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Introducing Skills Banner'),
            ).not.toBeInTheDocument()
        })

        it('renders ReviewSkillsSection when the wizard is in_progress', () => {
            enableWizardMode({ status: SkillWizardStatus.InProgress })
            renderComponent()

            expect(
                screen.getByRole('region', { name: 'Review Skills' }),
            ).toBeInTheDocument()
        })

        it('does not render ReviewSkillsSection while the hook is loading', () => {
            mockUseFlag.mockReturnValue(true)
            const wizard = {
                ...baseEnrichedWizard,
                status: SkillWizardStatus.NotStarted,
            }
            mockUseSkillWizard.mockReturnValue({
                wizard,
                guidanceActions: [],
                isLoading: true,
                isError: false,
            })
            mockUseGetWizard.mockReturnValue({
                data: wizard,
            } as unknown as ReturnType<typeof useGetWizard>)
            renderComponent()

            expect(
                screen.queryByRole('region', { name: 'Review Skills' }),
            ).not.toBeInTheDocument()
        })

        it('does not render ReviewSkillsSection when the wizard is completed', () => {
            enableWizardMode({ status: SkillWizardStatus.Completed })
            renderComponent()

            expect(
                screen.queryByRole('region', { name: 'Review Skills' }),
            ).not.toBeInTheDocument()
        })

        it('does not render ReviewSkillsSection when the feature flag is off', () => {
            mockUseFlag.mockReturnValue(false)
            mockUseSkillWizard.mockReturnValue({
                wizard: {
                    ...baseEnrichedWizard,
                    status: SkillWizardStatus.InProgress,
                },
                guidanceActions: [],
                isLoading: false,
                isError: false,
            })
            renderComponent()

            expect(
                screen.queryByRole('region', { name: 'Review Skills' }),
            ).not.toBeInTheDocument()
        })

        it('hides RecommendedSkillsSection and the skills table block in wizard mode', () => {
            enableWizardMode({ status: SkillWizardStatus.NotStarted })
            mockUseHasLinkedSkills.mockReturnValue({
                hasSkills: true,
                isLoading: false,
                isError: false,
            })
            renderComponent()

            expect(
                screen.queryByText(/Recommended Skills/),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('region', { name: 'Skills Table' }),
            ).not.toBeInTheDocument()
        })

        it('hides the header CTAs (View intents, Create skill) in wizard mode', () => {
            enableWizardMode({ status: SkillWizardStatus.InProgress })
            renderComponent()

            expect(
                screen.queryByRole('button', { name: /view intents/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /create skill/i }),
            ).not.toBeInTheDocument()
        })

        it('navigates to the wizard step when the CTA is clicked', async () => {
            const user = userEvent.setup()
            enableWizardMode({
                status: SkillWizardStatus.InProgress,
                ui_wizard_state: { total_count: 3, current_step: 2 },
            })
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /Review CTA/i }),
            )

            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-agent/shopify/test-shop/skills/wizard?step=2',
            )
        })
    })
})
