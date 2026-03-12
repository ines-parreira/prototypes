import { screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'

import {
    mockCreateJobHandler,
    mockGetCurrentUserHandler,
} from '@gorgias/helpdesk-mocks'

import { useCreateTicketTag } from '../../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useCreateTicketTag'
import { useListTagsSearch } from '../../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useListTagsSearch'
import { useTeamOptions } from '../../../../components/TicketAssignee/hooks/useTeamOptions'
import { useUserOptions } from '../../../../components/TicketAssignee/hooks/useUserOptions'
import { render, testAppQueryClient } from '../../../../tests/render.utils'
import { TicketListActions } from '../TicketListActions'

vi.mock('@gorgias/axiom', async (importOriginal) => ({
    ...(await importOriginal()),
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
    TooltipContent: ({ title }: { title: string }) => <div>{title}</div>,
}))

vi.mock('../../../../components/TicketAssignee/hooks/useTeamOptions', () => ({
    NO_TEAM_OPTION: { id: 'no_team', label: 'No team' },
    useTeamOptions: vi.fn(),
}))

vi.mock('../../../../components/TicketAssignee/hooks/useUserOptions', () => ({
    NO_USER_OPTION: { id: 'no_user', label: 'Unassigned' },
    useUserOptions: vi.fn(),
}))

vi.mock(
    '../../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useListTagsSearch',
    () => ({
        useListTagsSearch: vi.fn(),
    }),
)

vi.mock(
    '../../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useCreateTicketTag',
    () => ({
        useCreateTicketTag: vi.fn(),
    }),
)

const mockCurrentUser = mockGetCurrentUserHandler()
const mockCreateJob = mockCreateJobHandler()
const mockUseTeamOptions = vi.mocked(useTeamOptions)
const mockUseUserOptions = vi.mocked(useUserOptions)
const mockUseListTagsSearch = vi.mocked(useListTagsSearch)
const mockUseCreateTicketTag = vi.mocked(useCreateTicketTag)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    testAppQueryClient.clear()
    server.use(mockCurrentUser.handler, mockCreateJob.handler)
    mockUseTeamOptions.mockReturnValue({
        teamsMap: new Map(),
        teamSections: [],
        selectedOption: undefined,
        isLoading: false,
        search: '',
        setSearch: vi.fn(),
        onLoad: vi.fn(),
        shouldLoadMore: false,
    })
    mockUseUserOptions.mockReturnValue({
        usersMap: new Map(),
        userSections: [],
        selectedOption: undefined,
        isLoading: false,
        search: '',
        setSearch: vi.fn(),
        onLoad: vi.fn(),
        shouldLoadMore: false,
    })
    mockUseListTagsSearch.mockReturnValue({
        data: {
            pages: [
                {
                    data: {
                        data: [],
                    },
                },
            ],
        },
        search: '',
        setSearch: vi.fn(),
        isLoading: false,
        shouldLoadMore: false,
        onLoad: vi.fn(),
    } as never)
    mockUseCreateTicketTag.mockReturnValue({
        createTicketTag: vi.fn(),
        isCreating: false,
    })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const defaultProps = {
    viewId: 123,
    selectedTicketIds: new Set<number>(),
    visibleTicketIds: [],
    hasSelectedAll: false,
    selectionCount: 0,
    onSelectAll: vi.fn(),
    onActionComplete: vi.fn(),
}

describe('TicketListActions', () => {
    describe('checkbox label and state', () => {
        it.each([
            {
                selectionCount: 0,
                hasSelectedAll: false,
                expectedLabel: 'Select all',
            },
            {
                selectionCount: 2,
                hasSelectedAll: false,
                expectedLabel: '2 selected',
            },
            {
                selectionCount: 0,
                hasSelectedAll: true,
                expectedLabel: 'All selected',
            },
        ])(
            'shows "$expectedLabel" when selectionCount=$selectionCount hasSelectedAll=$hasSelectedAll',
            ({ selectionCount, hasSelectedAll, expectedLabel }) => {
                render(
                    <TicketListActions
                        {...defaultProps}
                        selectionCount={selectionCount}
                        hasSelectedAll={hasSelectedAll}
                    />,
                )

                expect(screen.getByText(expectedLabel)).toBeInTheDocument()
                expect(
                    screen.getByRole('checkbox', { name: expectedLabel }),
                ).toBeInTheDocument()
            },
        )
    })

    describe('action buttons disabled when nothing is selected', () => {
        it.each([{ name: /close tickets/i }, { name: /more actions/i }])(
            '"$name" button is disabled when nothing is selected',
            ({ name }) => {
                render(<TicketListActions {...defaultProps} />)

                expect(screen.getByRole('button', { name })).toBeDisabled()
            },
        )

        it('"Assign agent" button is disabled when nothing is selected', () => {
            render(<TicketListActions {...defaultProps} />)

            expect(screen.getByLabelText(/assign agent/i)).toBeDisabled()
        })
    })

    it('shows a disabled tooltip on the close button when nothing is selected', () => {
        render(<TicketListActions {...defaultProps} />)

        expect(
            screen.getByText('Select one or more tickets to close'),
        ).toBeInTheDocument()
    })

    it('shows the default tooltip on the close button when tickets are selected', () => {
        render(
            <TicketListActions
                {...defaultProps}
                selectionCount={1}
                selectedTicketIds={new Set([1])}
            />,
        )

        expect(screen.getByText('Close tickets')).toBeInTheDocument()
    })

    it('enables action buttons when tickets are selected', () => {
        render(
            <TicketListActions
                {...defaultProps}
                selectionCount={2}
                selectedTicketIds={new Set([1, 2])}
            />,
        )

        expect(
            screen.getByRole('button', { name: /close tickets/i }),
        ).not.toBeDisabled()
        expect(screen.getByLabelText(/assign agent/i)).not.toBeDisabled()
        expect(
            screen.getByRole('button', { name: /more actions/i }),
        ).not.toBeDisabled()
    })

    it('calls onSelectAll(true) when the checkbox is clicked while nothing is selected', async () => {
        const onSelectAll = vi.fn()
        const { user } = render(
            <TicketListActions
                {...defaultProps}
                visibleTicketIds={[1]}
                onSelectAll={onSelectAll}
            />,
        )

        await user.click(screen.getByRole('checkbox', { name: 'Select all' }))

        expect(onSelectAll).toHaveBeenCalledWith(true)
    })

    describe('onApplyMacro integration', () => {
        it('calls onApplyMacro with selected ticket IDs when Apply macro is clicked', async () => {
            const onApplyMacro = vi.fn()
            const { user } = render(
                <TicketListActions
                    {...defaultProps}
                    selectedTicketIds={new Set([1, 2, 3])}
                    selectionCount={3}
                    onApplyMacro={onApplyMacro}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /more actions/i }),
            )
            await waitFor(() => {
                expect(
                    screen.getByRole('menuitem', { name: /apply macro/i }),
                ).toBeInTheDocument()
            })
            await user.click(
                screen.getByRole('menuitem', { name: /apply macro/i }),
            )

            expect(onApplyMacro).toHaveBeenCalledWith([1, 2, 3])
        })
    })
})
