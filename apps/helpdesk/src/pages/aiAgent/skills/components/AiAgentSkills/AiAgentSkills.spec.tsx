import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
jest.mock('../IntentsTable/IntentsTable', () => ({
    IntentsTable: ({
        isOpen,
        onOpenChange,
    }: {
        isOpen: boolean
        onOpenChange: (open: boolean) => void
    }) => (
        <div data-testid="intents-table" data-open={isOpen}>
            Intents Table
            <button onClick={() => onOpenChange(false)}>Close</button>
        </div>
    ),
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

            const intentsTable = screen.getByTestId('intents-table')
            expect(intentsTable).toHaveAttribute('data-open', 'false')
        })

        it('should open intents table when "View intents" is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const viewIntentsButton = screen.getByRole('button', {
                name: /view intents/i,
            })
            await user.click(viewIntentsButton)

            await waitFor(() => {
                const intentsTable = screen.getByTestId('intents-table')
                expect(intentsTable).toHaveAttribute('data-open', 'true')
            })
        })

        it('should close intents table when close button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const viewIntentsButton = screen.getByRole('button', {
                name: /view intents/i,
            })
            await user.click(viewIntentsButton)

            await waitFor(() => {
                const intentsTable = screen.getByTestId('intents-table')
                expect(intentsTable).toHaveAttribute('data-open', 'true')
            })

            const closeButton = screen.getByRole('button', { name: /close/i })
            await user.click(closeButton)

            await waitFor(() => {
                const intentsTable = screen.getByTestId('intents-table')
                expect(intentsTable).toHaveAttribute('data-open', 'false')
            })
        })
    })
})
