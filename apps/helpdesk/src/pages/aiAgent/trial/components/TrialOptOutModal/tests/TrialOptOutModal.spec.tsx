import { render, screen, waitFor } from '@testing-library/react'
import user from '@testing-library/user-event'

import { logEvent } from 'common/segment/segment'
import { SegmentEvent } from 'common/segment/types'
import useAppDispatch from 'hooks/useAppDispatch'
import { useOptOutSalesTrialUpgradeMutation } from 'models/aiAgent/queries'
import * as trialExtensionUtils from 'pages/aiAgent/trial/utils/trialExtensionUtils'

import TrialOptOutModal from '../TrialOptOutModal'

jest.mock('common/segment/segment')
jest.mock('hooks/useAppDispatch')
jest.mock('models/aiAgent/queries')
jest.mock('pages/aiAgent/trial/utils/trialExtensionUtils')

const mockLogEvent = logEvent as jest.Mock
const mockUseAppDispatch = useAppDispatch as jest.Mock
const mockUseOptOutSalesTrialUpgradeMutation =
    useOptOutSalesTrialUpgradeMutation as jest.Mock
const mockCanRequestTrialExtension = jest.spyOn(
    trialExtensionUtils,
    'canRequestTrialExtension',
)
const mockMarkTrialExtensionRequested = jest.spyOn(
    trialExtensionUtils,
    'markTrialExtensionRequested',
)

describe('TrialOptOutModal', () => {
    const mockOnClose = jest.fn()
    const mockMutate = jest.fn()
    const mockDispatch = jest.fn()
    const mockOnRequestTrialExtension = jest.fn()

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onRequestTrialExtension: mockOnRequestTrialExtension,
    }

    const mockMutation = {
        mutate: mockMutate,
        isLoading: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockUseOptOutSalesTrialUpgradeMutation.mockReturnValue(mockMutation)
        mockCanRequestTrialExtension.mockReturnValue(true)
        mockMarkTrialExtensionRequested.mockImplementation(() => {})
    })

    describe('when modal is open', () => {
        it('should render modal with correct title and content', () => {
            render(<TrialOptOutModal {...defaultProps} />)

            expect(screen.getByText('Opt out of upgrade?')).toBeInTheDocument()
            expect(
                screen.getByText(
                    /You won't be automatically upgraded when your trial ends/,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/what you will miss out on/),
            ).toBeInTheDocument()
        })

        it('should render features list with all features', () => {
            render(<TrialOptOutModal {...defaultProps} />)

            expect(
                screen.getByText(
                    /Smart product recommendations that convert browsers into buyers/,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Dynamic discounts to reduce cart abandonment/,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Reduce drop-off and build purchase confidence/,
                ),
            ).toBeInTheDocument()
        })

        it('should render action buttons with correct labels', () => {
            render(<TrialOptOutModal {...defaultProps} />)

            expect(
                screen.getByRole('button', { name: 'Request Trial Extension' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Opt Out Anyway' }),
            ).toBeInTheDocument()
        })

        it('should pass loading state to OptOutModal', () => {
            mockUseOptOutSalesTrialUpgradeMutation.mockReturnValue({
                ...mockMutation,
                isLoading: true,
            })

            render(<TrialOptOutModal {...defaultProps} />)

            const optOutButton = screen.getByRole('button', {
                name: /Opt Out Anyway/,
            })
            expect(optOutButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('when modal is closed', () => {
        it('should not render modal content when isOpen is false', () => {
            render(<TrialOptOutModal {...defaultProps} isOpen={false} />)

            expect(
                screen.queryByText('Opt out of upgrade?'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(/You won't be automatically upgraded/),
            ).not.toBeInTheDocument()
        })
    })

    describe('when user clicks opt out button', () => {
        it('should log segment event and call mutation', async () => {
            const userEventSetup = user.setup()
            render(<TrialOptOutModal {...defaultProps} />)

            const optOutButton = screen.getByRole('button', {
                name: 'Opt Out Anyway',
            })
            await userEventSetup.click(optOutButton)

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialOptOutModalClicked,
                {
                    CTA: 'Opt Out Anyway',
                },
            )
            expect(mockMutate).toHaveBeenCalledWith([], {
                onSuccess: expect.any(Function),
            })
        })

        it('should call onClose when mutation succeeds', async () => {
            const userEventSetup = user.setup()
            render(<TrialOptOutModal {...defaultProps} />)

            const optOutButton = screen.getByRole('button', {
                name: 'Opt Out Anyway',
            })
            await userEventSetup.click(optOutButton)

            // Simulate successful mutation
            const onSuccessCallback = mockMutate.mock.calls[0][1].onSuccess
            onSuccessCallback()

            expect(mockOnClose).toHaveBeenCalled()
        })

        it('should dispatch notification when mutation succeeds', async () => {
            const userEventSetup = user.setup()
            render(<TrialOptOutModal {...defaultProps} />)

            const optOutButton = screen.getByRole('button', {
                name: 'Opt Out Anyway',
            })
            await userEventSetup.click(optOutButton)

            // Simulate successful mutation
            const onSuccessCallback = mockMutate.mock.calls[0][1].onSuccess
            onSuccessCallback()

            expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function))
        })
    })

    describe('when user clicks request trial extension button', () => {
        it('should call onRequestTrialExtension', async () => {
            const userEventSetup = user.setup()
            mockOnRequestTrialExtension.mockResolvedValue(true)
            render(<TrialOptOutModal {...defaultProps} />)

            const requestButton = screen.getByRole('button', {
                name: 'Request Trial Extension',
            })
            await userEventSetup.click(requestButton)

            expect(mockOnRequestTrialExtension).toHaveBeenCalledTimes(1)
        })

        it('should close modal when onRequestTrialExtension resolves with true', async () => {
            const userEventSetup = user.setup()
            mockOnRequestTrialExtension.mockResolvedValue(true)
            render(<TrialOptOutModal {...defaultProps} />)

            const requestButton = screen.getByRole('button', {
                name: 'Request Trial Extension',
            })
            await userEventSetup.click(requestButton)

            await waitFor(() => {
                expect(mockOnClose).toHaveBeenCalled()
            })
        })

        it('should not close modal when onRequestTrialExtension resolves with false', async () => {
            const userEventSetup = user.setup()
            mockOnRequestTrialExtension.mockResolvedValue(false)
            render(<TrialOptOutModal {...defaultProps} />)

            const requestButton = screen.getByRole('button', {
                name: 'Request Trial Extension',
            })
            await userEventSetup.click(requestButton)

            await waitFor(() => {
                expect(mockOnRequestTrialExtension).toHaveBeenCalledTimes(1)
            })

            expect(mockOnClose).not.toHaveBeenCalled()
        })

        it('should be disabled when trial extension cannot be requested', () => {
            mockCanRequestTrialExtension.mockReturnValue(false)
            render(<TrialOptOutModal {...defaultProps} />)

            const requestButton = screen.getByRole('button', {
                name: 'Request Trial Extension',
            })

            expect(requestButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should show tooltip when button is disabled', async () => {
            const userEventSetup = user.setup()
            mockCanRequestTrialExtension.mockReturnValue(false)
            render(<TrialOptOutModal {...defaultProps} />)

            const requestButton = screen.getByRole('button', {
                name: /request trial extension/i,
            })

            await userEventSetup.hover(requestButton)

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Trial extension request was already sent within the last 24 hours. Please wait before requesting again.',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('should call markTrialExtensionRequested when extension request succeeds', async () => {
            const userEventSetup = user.setup()
            mockOnRequestTrialExtension.mockResolvedValue(true)
            render(<TrialOptOutModal {...defaultProps} />)

            const requestButton = screen.getByRole('button', {
                name: 'Request Trial Extension',
            })
            await userEventSetup.click(requestButton)

            await waitFor(() => {
                expect(mockMarkTrialExtensionRequested).toHaveBeenCalled()
            })
        })
    })

    describe('when user closes modal', () => {
        it('should log segment event and close modal', async () => {
            const userEventSetup = user.setup()
            render(<TrialOptOutModal {...defaultProps} />)

            const closeButton = screen.getByRole('button', { name: '' })
            await userEventSetup.click(closeButton)

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialOptOutModalClicked,
                {
                    CTA: 'Close',
                },
            )
            expect(mockOnClose).toHaveBeenCalled()
        })
    })
})
