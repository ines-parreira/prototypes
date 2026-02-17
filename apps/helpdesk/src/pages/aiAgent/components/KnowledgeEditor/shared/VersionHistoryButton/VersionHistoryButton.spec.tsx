import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { VersionHistoryButtonProps, VersionItem } from './types'
import { VersionHistoryButton } from './VersionHistoryButton'

jest.mock('@repo/utils', () => ({
    DateAndTimeFormatting: { CompactDateWithTime: 'CompactDateWithTime' },
    formatDatetime: jest.fn(() => 'Jan 1, 2024 12:00 PM'),
}))

jest.mock('hooks/useAppSelector', () => (fn: () => unknown) => fn())

jest.mock('state/currentUser/selectors', () => ({
    getTimezone: jest.fn(() => 'UTC'),
    getDateAndTimeFormatter: jest.fn(() => () => 'MM/dd/yyyy HH:mm'),
}))

jest.mock('./useVersionUsers', () => ({
    useVersionUsers: jest
        .fn()
        .mockReturnValue({ userNames: new Map(), isLoading: false }),
}))

const { useVersionUsers } = jest.requireMock('./useVersionUsers') as {
    useVersionUsers: jest.Mock
}

const mockVersions: VersionItem[] = [
    {
        id: 3,
        version: 3,
        commit_message: 'Latest update',
        published_datetime: '2025-03-15T10:00:00Z',
        publisher_user_id: 1,
    },
    {
        id: 2,
        version: 2,
        commit_message: 'Second revision',
        published_datetime: '2025-02-10T08:00:00Z',
        publisher_user_id: 2,
    },
    {
        id: 1,
        version: 1,
    },
]

const defaultProps: VersionHistoryButtonProps<VersionItem> = {
    versions: mockVersions,
    isLoading: false,
    currentVersionId: 3,
    selectedVersionId: null,
    onSelectVersion: jest.fn(),
    isDisabled: false,
}

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
})

function renderComponent(
    overrides?: Partial<VersionHistoryButtonProps<VersionItem>>,
) {
    return render(
        <QueryClientProvider client={queryClient}>
            <VersionHistoryButton {...defaultProps} {...overrides} />
        </QueryClientProvider>,
    )
}

function getTriggerButton() {
    return screen.getByRole('button', { name: /history/i })
}

describe('VersionHistoryButton', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useVersionUsers.mockReturnValue({
            userNames: new Map(),
            isLoading: false,
        })
    })

    it('keeps the trigger visible and renders loading items inside the select', async () => {
        const user = userEvent.setup()
        renderComponent({ isLoading: true })
        expect(getTriggerButton()).toBeInTheDocument()

        await user.click(getTriggerButton())

        expect(screen.getAllByRole('option')).toHaveLength(3)
    })

    it('renders nothing when versions list is empty', () => {
        const { container } = renderComponent({ versions: [] })

        expect(container.firstChild).toBeNull()
    })

    it('renders nothing when there is only a draft and no current version', () => {
        const { container } = renderComponent({
            versions: [
                {
                    id: 5,
                    version: 5,
                    published_datetime: null,
                    created_datetime: '2025-03-15T10:00:00Z',
                    commit_message: 'Draft changes',
                },
            ],
            currentVersionId: null,
        })

        expect(container.firstChild).toBeNull()
    })

    it('renders the trigger button', () => {
        renderComponent()

        expect(getTriggerButton()).toBeInTheDocument()
    })

    it('renders version options with date and commit message', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(getTriggerButton())

        const dateOptions = screen.getAllByRole('option', {
            name: /Jan 1, 2024/i,
        })
        expect(dateOptions).toHaveLength(2)
        expect(
            screen.getByRole('option', { name: /Version 1/i }),
        ).toBeInTheDocument()
    })

    it('marks the current version with "(current)" label', async () => {
        const user = userEvent.setup()
        renderComponent({ currentVersionId: 2 })

        await user.click(getTriggerButton())

        const currentOption = screen.getByRole('option', {
            name: /Jan 1, 2024.*\(current\)/i,
        })
        expect(currentOption).toBeInTheDocument()
    })

    it('marks draft versions with "(draft edits)" label', async () => {
        const user = userEvent.setup()
        renderComponent({
            versions: [
                {
                    id: 5,
                    version: 5,
                    published_datetime: null,
                    created_datetime: '2025-03-15T10:00:00Z',
                    commit_message: 'Draft changes',
                    publisher_user_id: 1,
                },
            ],
            currentVersionId: 5,
        })

        await user.click(getTriggerButton())

        const draftOption = screen.getByRole('option', {
            name: /Jan 1, 2024.*\(draft edits\)/i,
        })
        expect(draftOption).toBeInTheDocument()
    })

    it('shows user name when user has no commit message', async () => {
        useVersionUsers.mockReturnValue({
            userNames: new Map([
                [1, 'Iris Ebert'],
                [2, 'Felipe Mora'],
            ]),
            isLoading: false,
        })
        const user = userEvent.setup()
        renderComponent({
            versions: [
                {
                    id: 10,
                    version: 10,
                    published_datetime: '2025-03-15T10:00:00Z',
                    publisher_user_id: 1,
                },
            ],
            currentVersionId: null,
        })

        await user.click(getTriggerButton())

        expect(
            screen.getByRole('option', {
                name: /Iris Ebert/i,
            }),
        ).toBeInTheDocument()
    })

    it('shows "Name: commit message" when user and commit message are present', async () => {
        useVersionUsers.mockReturnValue({
            userNames: new Map([[1, 'Iris Ebert']]),
            isLoading: false,
        })
        const user = userEvent.setup()
        renderComponent({
            versions: [
                {
                    id: 10,
                    version: 10,
                    commit_message: 'Latest update',
                    published_datetime: '2025-03-15T10:00:00Z',
                    publisher_user_id: 1,
                },
            ],
            currentVersionId: null,
        })

        await user.click(getTriggerButton())

        expect(
            screen.getByRole('option', {
                name: /Iris Ebert.*Latest update/i,
            }),
        ).toBeInTheDocument()
    })

    it('renders the full commit message text (CSS handles visual truncation)', async () => {
        const user = userEvent.setup()
        renderComponent({
            versions: [
                {
                    id: 1,
                    version: 1,
                    commit_message:
                        'This is a very long commit message that exceeds the limit',
                    published_datetime: '2025-01-01T12:00:00Z',
                },
            ],
            currentVersionId: null,
        })

        await user.click(getTriggerButton())

        const option = screen.getByRole('option')
        expect(option).toHaveTextContent(
            'This is a very long commit message that exceeds the limit',
        )
    })

    it('calls onSelectVersion when an option is selected', async () => {
        const onSelectVersion = jest.fn()
        const user = userEvent.setup()
        renderComponent({ onSelectVersion })

        await user.click(getTriggerButton())

        const options = screen.getAllByRole('option', {
            name: /Jan 1, 2024/i,
        })
        await user.click(options[1])

        expect(onSelectVersion).toHaveBeenCalledWith(mockVersions[1])
    })

    it('disables the trigger button when isDisabled is true', () => {
        renderComponent({ isDisabled: true })

        expect(getTriggerButton()).toHaveAttribute('aria-disabled', 'true')
    })

    it('displays formatted dates in version options', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(getTriggerButton())

        const dateTexts = screen.getAllByText(/Jan 1, 2024/)
        expect(dateTexts.length).toBeGreaterThanOrEqual(2)
    })

    it('falls back to "Version X" when no date is available', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(getTriggerButton())

        expect(
            screen.getByRole('option', { name: /Version 1/i }),
        ).toBeInTheDocument()
    })

    describe('pagination', () => {
        it('selects the version matching selectedVersionId', () => {
            renderComponent({ selectedVersionId: 2 })

            const nativeSelect = document.querySelector('select')
            expect(nativeSelect).toHaveValue('2')
        })

        it('falls back to currentVersionId when selectedVersionId is null', () => {
            renderComponent({
                currentVersionId: 3,
                selectedVersionId: null,
            })

            const nativeSelect = document.querySelector('select')
            expect(nativeSelect).toHaveValue('3')
        })
    })
})
