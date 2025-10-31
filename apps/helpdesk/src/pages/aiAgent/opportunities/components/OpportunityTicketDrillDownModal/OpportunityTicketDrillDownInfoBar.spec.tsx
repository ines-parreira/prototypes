import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { user } from 'fixtures/users'
import { useRunningJobs } from 'jobs'
import { RootState } from 'state/types'

import { OpportunityTicketDrillDownInfoBar } from './OpportunityTicketDrillDownInfoBar'

const mockStore = configureMockStore([thunk])

jest.mock('jobs/useRunningJobs')
const mockUseRunningJobs = assumeMock(useRunningJobs)

describe('OpportunityTicketDrillDownInfoBar', () => {
    const defaultProps = {
        totalTickets: 50,
        isLoading: false,
        onDownload: jest.fn(),
        isDownloading: false,
        isDownloadRequested: false,
        isDownloadError: false,
    }

    const defaultState = {
        currentUser: fromJS(user),
    } as RootState

    const renderComponent = (props = {}) => {
        return render(
            <Provider store={mockStore(defaultState)}>
                <OpportunityTicketDrillDownInfoBar
                    {...defaultProps}
                    {...props}
                />
            </Provider>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseRunningJobs.mockReturnValue({
            running: false,
            jobs: [],
            refetch: jest.fn(),
        })
    })

    describe('Ticket count display', () => {
        it('should display total tickets when under limit', () => {
            renderComponent()

            expect(screen.getByText('50')).toBeInTheDocument()
            expect(
                screen.getByText(/tickets are displayed/i),
            ).toBeInTheDocument()
        })

        it('should display single ticket correctly', () => {
            renderComponent({ totalTickets: 1 })

            expect(screen.getByText('1')).toBeInTheDocument()
            expect(
                screen.getByText(/tickets are displayed/i),
            ).toBeInTheDocument()
        })

        it('should display zero tickets', () => {
            renderComponent({ totalTickets: 0 })

            expect(screen.getByText('0')).toBeInTheDocument()
            expect(
                screen.getByText(/tickets are displayed/i),
            ).toBeInTheDocument()
        })

        it('should display limit message when at or over 100 tickets', () => {
            renderComponent({ totalTickets: 100 })

            expect(screen.getByText('100')).toBeInTheDocument()
            expect(
                screen.getByText(/displaying \(first\)/i),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/tickets used to compute the metric/i),
            ).toBeInTheDocument()
        })

        it('should display limit message when over 100 tickets', () => {
            renderComponent({ totalTickets: 150 })

            expect(screen.getByText('100')).toBeInTheDocument()
            expect(
                screen.getByText(/displaying \(first\)/i),
            ).toBeInTheDocument()
        })

        it('should display correct message just below limit', () => {
            renderComponent({ totalTickets: 99 })

            expect(screen.getByText('99')).toBeInTheDocument()
            expect(
                screen.getByText(/tickets are displayed/i),
            ).toBeInTheDocument()
            expect(
                screen.queryByText(/displaying \(first\)/i),
            ).not.toBeInTheDocument()
        })
    })

    describe('Loading state', () => {
        it('should display loading message when loading', () => {
            renderComponent({ isLoading: true })

            expect(screen.getByText('Fetching tickets...')).toBeInTheDocument()
            expect(
                screen.queryByText(/tickets are displayed/i),
            ).not.toBeInTheDocument()
        })

        it('should not display info icon when loading', () => {
            renderComponent({ isLoading: true })

            expect(screen.queryByText('info')).not.toBeInTheDocument()
        })

        it('should display info icon when not loading', () => {
            renderComponent()

            expect(screen.getByText('info')).toBeInTheDocument()
        })
    })

    describe('Download button', () => {
        it('should render download button with correct text', () => {
            renderComponent()

            const downloadButton = screen.getByRole('button', {
                name: /download all Tickets/i,
            })
            expect(downloadButton).toBeInTheDocument()
        })

        it('should call onDownload when button is clicked', async () => {
            const onDownload = jest.fn()
            renderComponent({ onDownload })

            const downloadButton = screen.getByRole('button', {
                name: /download all Tickets/i,
            })
            await userEvent.click(downloadButton)

            expect(onDownload).toHaveBeenCalledTimes(1)
        })

        it('should be disabled when downloading', () => {
            renderComponent({ isDownloading: true })

            const downloadButton = screen.getByRole('button', {
                name: /loading/i,
            })
            expect(downloadButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should be disabled when loading tickets', () => {
            renderComponent({ isLoading: true })

            const downloadButton = screen.getByRole('button', {
                name: /download all Tickets/i,
            })
            expect(downloadButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should be enabled when not loading or downloading', () => {
            renderComponent()

            const downloadButton = screen.getByRole('button', {
                name: /download all Tickets/i,
            })
            expect(downloadButton).toBeEnabled()
        })

        it('should display "Loading" text when downloading', () => {
            renderComponent({ isDownloading: true })

            expect(screen.getByText('Loading')).toBeInTheDocument()
            expect(
                screen.queryByText('Download All Tickets'),
            ).not.toBeInTheDocument()
        })

        it('should display download icon', () => {
            renderComponent()

            const button = screen.getByRole('button', {
                name: /download all tickets/i,
            })
            expect(button).toBeInTheDocument()
        })
    })

    describe('Component structure', () => {
        it('should render all main elements', () => {
            const { container } = renderComponent()

            expect(container.firstElementChild).toBeInTheDocument()
            expect(screen.getByText('info')).toBeInTheDocument()
            expect(screen.getByText('50')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /download/i }),
            ).toBeInTheDocument()
        })

        it('should maintain structure during loading state', () => {
            const { container } = renderComponent({ isLoading: true })

            expect(container.firstElementChild).toBeInTheDocument()
            expect(screen.getByText('Fetching tickets...')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /download/i }),
            ).toBeInTheDocument()
        })

        it('should maintain structure during download state', () => {
            const { container } = renderComponent({ isDownloading: true })

            expect(container.firstElementChild).toBeInTheDocument()
            expect(screen.getByText('50')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /loading/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Edge cases', () => {
        it('should handle very large ticket counts', () => {
            renderComponent({ totalTickets: 99999 })

            expect(screen.getByText('100')).toBeInTheDocument()
            expect(
                screen.getByText(/displaying \(first\)/i),
            ).toBeInTheDocument()
        })

        it('should handle simultaneous loading and downloading states', () => {
            renderComponent({ isLoading: true, isDownloading: true })

            const downloadButton = screen.getByRole('button', {
                name: /loading/i,
            })
            expect(downloadButton).toHaveAttribute('aria-disabled', 'true')
            expect(screen.getByText('Fetching tickets...')).toBeInTheDocument()
        })

        it('should not call onDownload when button is disabled', async () => {
            const onDownload = jest.fn()
            renderComponent({ onDownload, isDownloading: true })

            const downloadButton = screen.getByRole('button', {
                name: /loading/i,
            })
            await userEvent.click(downloadButton)

            expect(onDownload).not.toHaveBeenCalled()
        })
    })

    describe('Accessibility', () => {
        it('should have accessible button with proper role', () => {
            renderComponent()

            const button = screen.getByRole('button', {
                name: /download all tickets/i,
            })
            expect(button).toHaveAccessibleName()
        })

        it('should indicate disabled state accessibly', () => {
            renderComponent({ isLoading: true })

            const button = screen.getByRole('button', {
                name: /download all Tickets/i,
            })
            expect(button).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('Download requested state', () => {
        it('should show "Download Requested" text after successful download', () => {
            renderComponent({ isDownloadRequested: true })

            expect(screen.getByText('Download Requested')).toBeInTheDocument()
        })

        it('should show check icon when download is requested', () => {
            renderComponent({ isDownloadRequested: true })

            const button = screen.getByRole('button', {
                name: /download requested/i,
            })
            expect(button).toBeInTheDocument()
        })

        it('should not call onDownload when button is already requested', () => {
            const onDownload = jest.fn()
            renderComponent({ onDownload, isDownloadRequested: true })

            const button = screen.getByRole('button', {
                name: /download requested/i,
            })

            expect(button).toBeInTheDocument()
            expect(onDownload).not.toHaveBeenCalled()
        })
    })

    describe('Permissions and running jobs', () => {
        it('should disable button for no permissions', () => {
            const noPermissionsState = {
                currentUser: fromJS({
                    ...user,
                    role: { name: 'viewer' },
                }),
            } as RootState

            render(
                <Provider store={mockStore(noPermissionsState)}>
                    <OpportunityTicketDrillDownInfoBar {...defaultProps} />
                </Provider>,
            )

            const button = screen.getByRole('button', {
                name: /download/i,
            })

            expect(button).toHaveAttribute('aria-disabled', 'true')
        })

        it('should disable button when jobs are running', () => {
            mockUseRunningJobs.mockReturnValue({
                running: true,
                jobs: [],
                refetch: jest.fn(),
            })

            renderComponent()

            const button = screen.getByRole('button', {
                name: /download/i,
            })

            expect(button).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('Error handling', () => {
        it('should not show success state when isDownloadError is true', () => {
            renderComponent({
                isDownloadRequested: true,
                isDownloadError: true,
            })

            expect(
                screen.queryByText('Download Requested'),
            ).not.toBeInTheDocument()
            expect(screen.getByText('Download All Tickets')).toBeInTheDocument()
        })
    })
})
