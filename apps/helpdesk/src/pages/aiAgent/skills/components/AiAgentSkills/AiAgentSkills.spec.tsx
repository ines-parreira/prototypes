import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { ThemeProvider } from 'core/theme'
import { useHasLinkedSkills } from 'pages/aiAgent/skills/hooks/useHasLinkedSkills'
import { useSkillsTemplates } from 'pages/aiAgent/skills/hooks/useSkillsTemplates'
import { IntentStatus } from 'pages/aiAgent/skills/types'

import { AiAgentSkills } from './AiAgentSkills'

jest.mock('pages/aiAgent/skills/hooks/useHasLinkedSkills')
jest.mock('pages/aiAgent/skills/hooks/useSkillsTemplates')
jest.mock('../SkillsTable/SkillsTable', () => ({
    SkillsTable: () => <div data-testid="skills-table">Skills Table</div>,
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
    tag: 'Order',
    style: {
        color: 'content-accent-default',
        background: 'surface-accent-default',
    },
    intents: [
        {
            name: 'order::status',
            status: IntentStatus.NotLinked,
            help_center_id: 0,
            articles: [],
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
        mockUseSkillsTemplates.mockReturnValue([
            mockSkillTemplate as ReturnType<typeof useSkillsTemplates>[number],
        ])
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
        mockUseHasLinkedSkills.mockReturnValue({
            hasLinkedSkills: false,
            isLoading: false,
            isError: false,
        })

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
        expect(screen.getByTestId('skills-table')).toBeInTheDocument()
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
})
