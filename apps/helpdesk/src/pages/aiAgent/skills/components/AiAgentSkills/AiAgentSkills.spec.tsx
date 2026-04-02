import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { ThemeProvider } from 'core/theme'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { useHasLinkedSkills } from 'pages/aiAgent/skills/hooks/useHasLinkedSkills'
import { useSkillsTemplates } from 'pages/aiAgent/skills/hooks/useSkillsTemplates'
import { IntentStatus } from 'pages/aiAgent/skills/types'
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

const mockStore = configureMockStore([thunk])

const mockUseHasLinkedSkills = useHasLinkedSkills as jest.MockedFunction<
    typeof useHasLinkedSkills
>
const mockUseSkillsTemplates = useSkillsTemplates as jest.MockedFunction<
    typeof useSkillsTemplates
>

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
    let store: ReturnType<typeof mockStore>

    beforeEach(() => {
        jest.clearAllMocks()
        store = mockStore({
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
            } as ReturnType<typeof useAiAgentNavigation>['routes'],
        })
        mockUseSkillsTemplates.mockReturnValue({
            allSkillsTemplates: [mockSkillTemplate],
            availableSkillsTemplates: [mockSkillTemplate],
        })
        mockUseHasLinkedSkills.mockReturnValue({
            hasLinkedSkills: false,
            isLoading: false,
            isError: false,
        })
    })

    const renderComponent = () => {
        return render(
            <Provider store={store}>
                <ThemeProvider>
                    <AiAgentSkills />
                </ThemeProvider>
            </Provider>,
        )
    }

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
            hasLinkedSkills: true,
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
            hasLinkedSkills: false,
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
                hasLinkedSkills: true,
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
})
