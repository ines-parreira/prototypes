import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { VersionHistoryButtonProps, VersionItem } from './types'
import { VersionHistoryButton } from './VersionHistoryButton'

const mockVersions: VersionItem[] = [
    {
        id: 3,
        version: 3,
        commit_message: 'Latest update',
        published_datetime: '2025-03-15T10:00:00Z',
    },
    {
        id: 2,
        version: 2,
        commit_message: 'Second revision',
        published_datetime: '2025-02-10T08:00:00Z',
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

function renderComponent(
    overrides?: Partial<VersionHistoryButtonProps<VersionItem>>,
) {
    return render(<VersionHistoryButton {...defaultProps} {...overrides} />)
}

function getTriggerButton() {
    return screen.getByRole('button', { name: /history/i })
}

describe('VersionHistoryButton', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders a skeleton when loading', () => {
        const { container } = renderComponent({ isLoading: true })

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
        expect(container.firstChild).toBeInTheDocument()
    })

    it('renders nothing when versions list is empty', () => {
        const { container } = renderComponent({ versions: [] })

        expect(container.firstChild).toBeNull()
    })

    it('renders the trigger button', () => {
        renderComponent()

        expect(getTriggerButton()).toBeInTheDocument()
    })

    it('renders version options with correct labels', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(getTriggerButton())

        const options = screen.getAllByRole('option')
        const labels = options.map((o) => o.textContent)

        expect(labels).toContain(
            'Version 3 (Current) - Latest update • Mar 15, 2025',
        )
        expect(labels).toContain('Version 2 - Second revision • Feb 10, 2025')
        expect(labels).toContain('Version 1')
    })

    it('marks the current version with "(Current)" label', async () => {
        const user = userEvent.setup()
        renderComponent({ currentVersionId: 2 })

        await user.click(getTriggerButton())

        const options = screen.getAllByRole('option')
        const labels = options.map((o) => o.textContent)

        expect(labels).toContain(
            'Version 2 (Current) - Second revision • Feb 10, 2025',
        )
        expect(labels).not.toContain(
            expect.stringContaining('Version 3 (Current)'),
        )
    })

    it('truncates long commit messages', async () => {
        const user = userEvent.setup()
        renderComponent({
            versions: [
                {
                    id: 1,
                    version: 1,
                    commit_message:
                        'This is a very long commit message that exceeds the limit',
                },
            ],
            currentVersionId: null,
        })

        await user.click(getTriggerButton())

        const option = screen.getByRole('option', {
            name: /Version 1/,
        })

        expect(option).toHaveTextContent(
            'Version 1 - This is a very long commi...',
        )
    })

    it('displays formatted dates in version labels', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(getTriggerButton())

        const options = screen.getAllByRole('option')
        const labels = options.map((o) => o.textContent)

        expect(labels.some((l) => l?.includes('Mar 15, 2025'))).toBe(true)
        expect(labels.some((l) => l?.includes('Feb 10, 2025'))).toBe(true)
    })

    it('calls onSelectVersion when an option is selected', async () => {
        const onSelectVersion = jest.fn()
        const user = userEvent.setup()
        renderComponent({ onSelectVersion })

        await user.click(getTriggerButton())

        const option = screen.getByRole('option', { name: /Version 2 -/ })
        await user.click(option)

        expect(onSelectVersion).toHaveBeenCalledWith(mockVersions[1])
    })

    it('disables the trigger button when isDisabled is true', () => {
        renderComponent({ isDisabled: true })

        expect(getTriggerButton()).toHaveAttribute('aria-disabled', 'true')
    })

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

    describe('pagination', () => {
        it('does not pass onLoadMore to Select when shouldLoadMore is false', async () => {
            const onLoadMore = jest.fn()
            const user = userEvent.setup()
            renderComponent({
                shouldLoadMore: false,
                onLoadMore,
            })

            await user.click(getTriggerButton())

            const listbox = screen.getByRole('listbox')
            expect(listbox).toBeInTheDocument()
        })

        it('passes onLoadMore to Select when shouldLoadMore is true', async () => {
            const onLoadMore = jest.fn()
            const user = userEvent.setup()
            renderComponent({
                shouldLoadMore: true,
                onLoadMore,
            })

            await user.click(getTriggerButton())

            const listbox = screen.getByRole('listbox')
            expect(listbox).toBeInTheDocument()
        })

        it('does not trigger onLoadMore when shouldLoadMore is false', async () => {
            const onLoadMore = jest.fn()
            const user = userEvent.setup()
            renderComponent({
                shouldLoadMore: false,
                onLoadMore,
            })

            await user.click(getTriggerButton())

            const listbox = screen.getByRole('listbox')
            expect(listbox).toBeInTheDocument()
        })
    })
})
