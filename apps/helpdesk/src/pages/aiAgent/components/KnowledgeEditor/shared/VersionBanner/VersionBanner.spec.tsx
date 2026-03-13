import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { VersionBanner } from './VersionBanner'

jest.mock('@repo/utils', () => ({
    DateAndTimeFormatting: { CompactDateWithTime: 'CompactDateWithTime' },
    formatDatetime: jest.fn(() => 'Jan 1, 2024 12:00 PM'),
}))

jest.mock('hooks/useAppSelector', () => (fn: () => unknown) => fn())

jest.mock('state/currentUser/selectors', () => ({
    getTimezone: jest.fn(() => 'UTC'),
    getDateAndTimeFormatter: jest.fn(() => () => 'MM/dd/yyyy HH:mm'),
}))

const mockUseGetUser = jest.fn().mockReturnValue({ data: undefined })
jest.mock('@gorgias/helpdesk-queries', () => ({
    useGetUser: (...args: unknown[]) => mockUseGetUser(...args),
}))

type HistoricalVersion = {
    publishedDatetime: string | null
    publisherUserId?: number
    commitMessage?: string
} | null

type DefaultProps = {
    isViewingDraft: boolean
    hasDraftVersion: boolean
    hasPublishedVersion: boolean
    isDisabled: boolean
    switchVersion: jest.Mock
    isViewingHistoricalVersion: boolean
    onGoToLatest: jest.Mock
    historicalVersion: HistoricalVersion
    isDiffMode?: boolean
    onToggleDiff?: jest.Mock
    className?: string
    isFromConversation?: boolean
}

const defaultProps: DefaultProps = {
    isViewingDraft: true,
    hasDraftVersion: true,
    hasPublishedVersion: true,
    isDisabled: false,
    switchVersion: jest.fn(),
    isViewingHistoricalVersion: false,
    onGoToLatest: jest.fn(),
    historicalVersion: null,
}

function renderComponent(overrides?: Partial<typeof defaultProps>) {
    return render(<VersionBanner {...defaultProps} {...overrides} />)
}

describe('VersionBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseGetUser.mockReturnValue({ data: undefined })
    })

    describe('when banner should not be shown', () => {
        it('returns null when both hasDraftVersion and hasPublishedVersion are false', () => {
            const { container } = renderComponent({
                hasDraftVersion: false,
                hasPublishedVersion: false,
            })

            expect(container.firstChild).toBeNull()
        })

        it('returns null when only hasDraftVersion is false', () => {
            const { container } = renderComponent({
                hasDraftVersion: false,
                hasPublishedVersion: true,
            })

            expect(container.firstChild).toBeNull()
        })

        it('returns null when only hasPublishedVersion is false', () => {
            const { container } = renderComponent({
                hasDraftVersion: true,
                hasPublishedVersion: false,
            })

            expect(container.firstChild).toBeNull()
        })
    })

    describe('when viewing draft version', () => {
        it('renders draft version message', () => {
            renderComponent({
                isViewingDraft: true,
            })

            expect(
                screen.getByText(/This is a draft version/i),
            ).toBeInTheDocument()
        })

        it('renders link to published version', () => {
            renderComponent({
                isViewingDraft: true,
            })

            expect(screen.getByText('published version')).toBeInTheDocument()
        })

        it('renders description about editing draft', () => {
            renderComponent({
                isViewingDraft: true,
            })

            expect(
                screen.getByText(
                    'Edit, test, and publish your draft to update the published version.',
                ),
            ).toBeInTheDocument()
        })

        it('calls switchVersion when clicking published version link', async () => {
            const switchVersion = jest.fn()
            const user = userEvent.setup()

            renderComponent({
                isViewingDraft: true,
                switchVersion,
            })

            await user.click(screen.getByText('published version'))

            expect(switchVersion).toHaveBeenCalledTimes(1)
        })

        it('does not call switchVersion when disabled', async () => {
            const switchVersion = jest.fn()
            const user = userEvent.setup()

            renderComponent({
                isViewingDraft: true,
                isDisabled: true,
                switchVersion,
            })

            await user.click(screen.getByText('published version'))

            expect(switchVersion).not.toHaveBeenCalled()
        })

        it('applies disabled styling to link when disabled', () => {
            renderComponent({
                isViewingDraft: true,
                isDisabled: true,
            })

            const link = screen.getByText('published version')
            expect(link.className).toContain('linkDisabled')
        })
    })

    describe('when viewing published version', () => {
        it('renders published version message', () => {
            renderComponent({
                isViewingDraft: false,
            })

            expect(
                screen.getByText(/This is a published version/i),
            ).toBeInTheDocument()
        })

        it('renders link to draft version', () => {
            renderComponent({
                isViewingDraft: false,
            })

            expect(screen.getByText('draft version')).toBeInTheDocument()
        })

        it('calls switchVersion when clicking draft version link', async () => {
            const switchVersion = jest.fn()
            const user = userEvent.setup()

            renderComponent({
                isViewingDraft: false,
                switchVersion,
            })

            await user.click(screen.getByText('draft version'))

            expect(switchVersion).toHaveBeenCalledTimes(1)
        })

        it('does not call switchVersion when disabled', async () => {
            const switchVersion = jest.fn()
            const user = userEvent.setup()

            renderComponent({
                isViewingDraft: false,
                isDisabled: true,
                switchVersion,
            })

            await user.click(screen.getByText('draft version'))

            expect(switchVersion).not.toHaveBeenCalled()
        })

        it('applies disabled styling to link when disabled', () => {
            renderComponent({
                isViewingDraft: false,
                isDisabled: true,
            })

            const link = screen.getByText('draft version')
            expect(link.className).toContain('linkDisabled')
        })
    })

    describe('when viewing historical version', () => {
        const historicalVersionProps = {
            isViewingDraft: false,
            isViewingHistoricalVersion: true,
            historicalVersion: {
                publishedDatetime: '2024-01-01T12:00:00Z',
                commitMessage: 'Fixed typo in greeting',
            },
        }

        it('renders historical version banner with formatted date', () => {
            renderComponent(historicalVersionProps)

            expect(
                screen.getByText(
                    /You are viewing a previous version published on Jan 1, 2024 12:00 PM/i,
                ),
            ).toBeInTheDocument()
        })

        it('shows commit message without author when only commit message is provided', () => {
            renderComponent(historicalVersionProps)

            expect(
                screen.getByText(
                    /Changes in this version: Fixed typo in greeting/i,
                ),
            ).toBeInTheDocument()
        })

        it('shows author name without commit message when only author is available', () => {
            mockUseGetUser.mockReturnValue({
                data: { data: { name: 'John Doe' } },
            })

            renderComponent({
                isViewingDraft: false,
                isViewingHistoricalVersion: true,
                historicalVersion: {
                    publishedDatetime: '2024-01-01T12:00:00Z',
                    publisherUserId: 42,
                },
            })

            expect(
                screen.getByText('Last published by John Doe'),
            ).toBeInTheDocument()
        })

        it('shows commit message with author name when both are available', () => {
            mockUseGetUser.mockReturnValue({
                data: { data: { name: 'Jane Smith' } },
            })

            renderComponent({
                isViewingDraft: false,
                isViewingHistoricalVersion: true,
                historicalVersion: {
                    publishedDatetime: '2024-01-01T12:00:00Z',
                    publisherUserId: 42,
                    commitMessage: 'Fixed typo in greeting',
                },
            })

            expect(
                screen.getByText(
                    'Changes by Jane Smith: Fixed typo in greeting',
                ),
            ).toBeInTheDocument()
        })

        it('does not show description when neither commit message nor author is provided', () => {
            renderComponent({
                isViewingDraft: false,
                isViewingHistoricalVersion: true,
                historicalVersion: {
                    publishedDatetime: '2024-01-01T12:00:00Z',
                },
            })

            expect(
                screen.queryByText(/Changes in this version/i),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(/^Last published by /),
            ).not.toBeInTheDocument()
        })

        it('shows "unknown date" when publishedDatetime is null', () => {
            renderComponent({
                isViewingDraft: false,
                isViewingHistoricalVersion: true,
                historicalVersion: {
                    publishedDatetime: null,
                },
            })

            expect(
                screen.getByText(
                    /You are viewing a previous version published on unknown date/i,
                ),
            ).toBeInTheDocument()
        })

        it('calls onGoToLatest when "Back to current" button is clicked', async () => {
            const onGoToLatest = jest.fn()
            const user = userEvent.setup()

            renderComponent({
                ...historicalVersionProps,
                onGoToLatest,
            })

            await user.click(
                screen.getByRole('button', { name: /Back to latest/i }),
            )

            expect(onGoToLatest).toHaveBeenCalledTimes(1)
        })

        it('disables back to latest button when isDisabled is true', () => {
            renderComponent({
                ...historicalVersionProps,
                isDisabled: true,
            })

            expect(
                screen.getByRole('button', { name: /Back to latest/i }),
            ).toBeDisabled()
        })

        it('does not render a restore button', () => {
            renderComponent(historicalVersionProps)

            expect(
                screen.queryByRole('button', { name: /Restore/i }),
            ).not.toBeInTheDocument()
        })

        it('applies custom className when provided', () => {
            const { container } = renderComponent({
                ...historicalVersionProps,
                className: 'custom-class',
            })

            expect(container.firstChild).toHaveClass('custom-class')
        })

        describe('diff toggle button', () => {
            it('renders unchecked toggle when onToggleDiff is provided and not in diff mode', () => {
                renderComponent({
                    ...historicalVersionProps,
                    onToggleDiff: jest.fn(),
                    isDiffMode: false,
                })

                expect(
                    screen.getByText('Compare to current'),
                ).toBeInTheDocument()
                expect(screen.getByRole('switch')).not.toBeChecked()
            })

            it('renders checked toggle when in diff mode', () => {
                renderComponent({
                    ...historicalVersionProps,
                    onToggleDiff: jest.fn(),
                    isDiffMode: true,
                })

                expect(
                    screen.getByText('Compare to current'),
                ).toBeInTheDocument()
                expect(screen.getByRole('switch')).toBeChecked()
            })

            it('does not render diff toggle when onToggleDiff is not provided', () => {
                renderComponent({
                    ...historicalVersionProps,
                })

                expect(
                    screen.queryByText('Compare to current'),
                ).not.toBeInTheDocument()
                expect(screen.queryByRole('switch')).not.toBeInTheDocument()
            })

            it('calls onToggleDiff when toggle is clicked off', async () => {
                const onToggleDiff = jest.fn()
                const user = userEvent.setup()

                renderComponent({
                    ...historicalVersionProps,
                    onToggleDiff,
                    isDiffMode: false,
                })

                await user.click(screen.getByRole('switch'))

                expect(onToggleDiff).toHaveBeenCalledTimes(1)
            })

            it('calls onToggleDiff when toggle is clicked on', async () => {
                const onToggleDiff = jest.fn()
                const user = userEvent.setup()

                renderComponent({
                    ...historicalVersionProps,
                    onToggleDiff,
                    isDiffMode: true,
                })

                await user.click(screen.getByRole('switch'))

                expect(onToggleDiff).toHaveBeenCalledTimes(1)
            })

            it('disables toggle when isDisabled is true', () => {
                renderComponent({
                    ...historicalVersionProps,
                    onToggleDiff: jest.fn(),
                    isDiffMode: false,
                    isDisabled: true,
                })

                expect(screen.getByRole('switch')).toBeDisabled()
            })
        })

        describe('when isFromConversation is true', () => {
            it('renders conversation-specific title', () => {
                renderComponent({
                    ...historicalVersionProps,
                    isFromConversation: true,
                })

                expect(
                    screen.getByText(
                        /This is the version used in this conversation, published on Jan 1, 2024 12:00 PM\. A newer version is available\./i,
                    ),
                ).toBeInTheDocument()
            })

            it('renders "View latest version" button without arrow', () => {
                renderComponent({
                    ...historicalVersionProps,
                    isFromConversation: true,
                })

                expect(
                    screen.getByRole('button', {
                        name: /View latest version/i,
                    }),
                ).toBeInTheDocument()
                expect(
                    screen.queryByRole('button', { name: /Back to latest/i }),
                ).not.toBeInTheDocument()
            })
        })

        describe('when isFromConversation is false or undefined', () => {
            it('renders default title when isFromConversation is false', () => {
                renderComponent({
                    ...historicalVersionProps,
                    isFromConversation: false,
                })

                expect(
                    screen.getByText(
                        /You are viewing a previous version published on Jan 1, 2024 12:00 PM/i,
                    ),
                ).toBeInTheDocument()
            })

            it('renders default title when isFromConversation is undefined', () => {
                renderComponent(historicalVersionProps)

                expect(
                    screen.getByText(
                        /You are viewing a previous version published on Jan 1, 2024 12:00 PM/i,
                    ),
                ).toBeInTheDocument()
            })

            it('renders "Back to latest" button with arrow', () => {
                renderComponent(historicalVersionProps)

                expect(
                    screen.getByRole('button', { name: /Back to latest/i }),
                ).toBeInTheDocument()
                expect(
                    screen.queryByRole('button', {
                        name: /View latest version/i,
                    }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('className prop', () => {
        it('applies custom className to draft version banner', () => {
            const { container } = renderComponent({
                isViewingDraft: true,
                className: 'custom-class',
            })

            expect(container.firstChild).toHaveClass('custom-class')
        })

        it('applies custom className to published version banner', () => {
            const { container } = renderComponent({
                isViewingDraft: false,
                className: 'custom-class',
            })

            expect(container.firstChild).toHaveClass('custom-class')
        })
    })
})
