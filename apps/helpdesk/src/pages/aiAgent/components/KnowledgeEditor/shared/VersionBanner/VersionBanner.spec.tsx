import type { ComponentProps } from 'react'

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

const defaultProps = {
    isViewingDraft: true,
    hasDraftVersion: true,
    hasPublishedVersion: true,
    isDisabled: false,
    switchVersion: jest.fn(),
    isViewingHistoricalVersion: false,
    onGoToLatest: jest.fn(),
    historicalVersion: null,
    onOpenRestoreModal: jest.fn(),
}

function renderComponent(
    overrides?: Partial<ComponentProps<typeof VersionBanner>>,
) {
    return render(<VersionBanner {...defaultProps} {...overrides} />)
}

describe('VersionBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks()
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

        it('shows commit message if provided', () => {
            renderComponent(historicalVersionProps)

            expect(
                screen.getByText(/Changes in this version:/i),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/Fixed typo in greeting/i),
            ).toBeInTheDocument()
        })

        it('does not show commit message if not provided', () => {
            renderComponent({
                isViewingHistoricalVersion: true,
                historicalVersion: {
                    publishedDatetime: '2024-01-01T12:00:00Z',
                },
            })

            expect(
                screen.queryByText(/Changes in this version/i),
            ).not.toBeInTheDocument()
        })

        it('shows "unknown date" when publishedDatetime is null', () => {
            renderComponent({
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
                screen.getByRole('button', { name: /Back to current/i }),
            )

            expect(onGoToLatest).toHaveBeenCalledTimes(1)
        })

        it('calls onOpenRestoreModal when "Restore this version" button is clicked', async () => {
            const onOpenRestoreModal = jest.fn()
            const user = userEvent.setup()

            renderComponent({
                ...historicalVersionProps,
                onOpenRestoreModal,
            })

            await user.click(
                screen.getByRole('button', { name: /Restore this version/i }),
            )

            expect(onOpenRestoreModal).toHaveBeenCalledTimes(1)
        })

        it('disables buttons when isDisabled is true', () => {
            renderComponent({
                ...historicalVersionProps,
                isDisabled: true,
            })

            expect(
                screen.getByRole('button', { name: /Back to current/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /Restore this version/i }),
            ).toBeDisabled()
        })

        it('applies custom className when provided', () => {
            const { container } = renderComponent({
                ...historicalVersionProps,
                className: 'custom-class',
            })

            expect(container.firstChild).toHaveClass('custom-class')
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
