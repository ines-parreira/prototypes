import { render, screen, waitFor } from '@testing-library/react'
import user from '@testing-library/user-event'

import { logEvent } from 'common/segment/segment'
import { SegmentEvent } from 'common/segment/types'
import useAppDispatch from 'hooks/useAppDispatch'
import * as useAppSelectorModule from 'hooks/useAppSelector'
import {
    useOptOutAiAgentTrialUpgradeMutation,
    useOptOutSalesTrialUpgradeMutation,
} from 'models/aiAgent/queries'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import * as trialExtensionUtils from 'pages/aiAgent/trial/utils/trialExtensionUtils'

import TrialOptOutModal from '../TrialOptOutModal'

jest.mock('common/segment/segment')
jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock('models/aiAgent/queries')
jest.mock('pages/aiAgent/trial/utils/trialExtensionUtils')

const mockLogEvent = logEvent as jest.Mock
const mockUseAppDispatch = useAppDispatch as jest.Mock
const mockUseAppSelector = jest.fn()
const mockUseOptOutSalesTrialUpgradeMutation =
    useOptOutSalesTrialUpgradeMutation as jest.Mock
const mockUseOptOutAiAgentTrialUpgradeMutation =
    useOptOutAiAgentTrialUpgradeMutation as jest.Mock
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
        trialType: TrialType.ShoppingAssistant,
        isTrialExtended: false,
    }

    const mockMutation = {
        mutate: mockMutate,
        isLoading: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(mockDispatch)

        jest.spyOn(useAppSelectorModule, 'default').mockImplementation(
            mockUseAppSelector,
        )
        mockUseAppSelector.mockReturnValue([])

        mockUseOptOutSalesTrialUpgradeMutation.mockReturnValue(mockMutation)
        mockUseOptOutAiAgentTrialUpgradeMutation.mockReturnValue(mockMutation)
        mockCanRequestTrialExtension.mockReturnValue(true)
        mockMarkTrialExtensionRequested.mockImplementation(() => {})
    })

    describe('when modal is open', () => {
        describe('with Shopping Assistant trial type', () => {
            it('should render modal with correct title and content for Shopping Assistant', () => {
                render(<TrialOptOutModal {...defaultProps} />)

                expect(
                    screen.getByText('Opt out of upgrade?'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        /You won't be automatically upgraded when your trial ends/,
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        /keep full access to the Shopping Assistant until then/,
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(/what you will miss out on/),
                ).toBeInTheDocument()
            })

            it('should render Shopping Assistant features list', () => {
                render(<TrialOptOutModal {...defaultProps} />)

                expect(
                    screen.getByText(
                        /Smart product recommendations that convert browsers into buyers based on real-time intent/,
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        /Dynamic discounts to reduce cart abandonment and recover at-risk sales/,
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        /Reduce drop-off and build purchase confidence through proactive engagement/,
                    ),
                ).toBeInTheDocument()
            })
        })

        describe('with AI Agent trial type', () => {
            const aiAgentProps = {
                ...defaultProps,
                trialType: TrialType.AiAgent,
            }

            it('should render modal with correct title and content for AI Agent', () => {
                render(<TrialOptOutModal {...aiAgentProps} />)

                expect(
                    screen.getByText('Opt out of upgrade?'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        /You won't be automatically upgraded when your trial ends/,
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        /keep full access to the AI Agent until then/,
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(/what you will miss out on/),
                ).toBeInTheDocument()
            })

            it('should render AI Agent features list', () => {
                render(<TrialOptOutModal {...aiAgentProps} />)

                expect(
                    screen.getByText(
                        /Deliver an exceptional, 24\/7 shopping experience/,
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        /Automate support inquiries to increase team productivity/,
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        /Increase conversions by 62% using real-time, personalized product recommendations/,
                    ),
                ).toBeInTheDocument()
            })
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

        it('should pass loading state to OptOutModal for Shopping Assistant', () => {
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

        it('should pass loading state to OptOutModal for AI Agent', () => {
            const aiAgentProps = {
                ...defaultProps,
                trialType: TrialType.AiAgent,
            }
            mockUseOptOutAiAgentTrialUpgradeMutation.mockReturnValue({
                ...mockMutation,
                isLoading: true,
            })

            render(<TrialOptOutModal {...aiAgentProps} />)

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
        it('should log segment event and call Shopping Assistant mutation', async () => {
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
                    trialType: TrialType.ShoppingAssistant,
                },
            )
            expect(mockMutate).toHaveBeenCalledWith([], {
                onSuccess: expect.any(Function),
            })
        })

        it('should log segment event and call AI Agent mutation', async () => {
            const aiAgentProps = {
                ...defaultProps,
                trialType: TrialType.AiAgent,
            }
            const userEventSetup = user.setup()
            render(<TrialOptOutModal {...aiAgentProps} />)

            const optOutButton = screen.getByRole('button', {
                name: 'Opt Out Anyway',
            })
            await userEventSetup.click(optOutButton)

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialOptOutModalClicked,
                {
                    CTA: 'Opt Out Anyway',
                    trialType: TrialType.AiAgent,
                },
            )
            expect(mockMutate).toHaveBeenCalledWith([], {
                onSuccess: expect.any(Function),
            })
        })

        it('should call onClose when Shopping Assistant mutation succeeds', async () => {
            const userEventSetup = user.setup()
            render(<TrialOptOutModal {...defaultProps} />)

            const optOutButton = screen.getByRole('button', {
                name: 'Opt Out Anyway',
            })
            await userEventSetup.click(optOutButton)

            const onSuccessCallback = mockMutate.mock.calls[0][1].onSuccess
            onSuccessCallback()

            expect(mockOnClose).toHaveBeenCalled()
        })

        it('should call onClose when AI Agent mutation succeeds', async () => {
            const aiAgentProps = {
                ...defaultProps,
                trialType: TrialType.AiAgent,
            }
            const userEventSetup = user.setup()
            render(<TrialOptOutModal {...aiAgentProps} />)

            const optOutButton = screen.getByRole('button', {
                name: 'Opt Out Anyway',
            })
            await userEventSetup.click(optOutButton)

            const onSuccessCallback = mockMutate.mock.calls[0][1].onSuccess
            onSuccessCallback()

            expect(mockOnClose).toHaveBeenCalled()
        })

        it('should dispatch Shopping Assistant notification when mutation succeeds', async () => {
            const userEventSetup = user.setup()
            render(<TrialOptOutModal {...defaultProps} />)

            const optOutButton = screen.getByRole('button', {
                name: 'Opt Out Anyway',
            })
            await userEventSetup.click(optOutButton)

            const onSuccessCallback = mockMutate.mock.calls[0][1].onSuccess
            onSuccessCallback()

            expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function))
        })

        it('should dispatch AI Agent notification when mutation succeeds', async () => {
            const aiAgentProps = {
                ...defaultProps,
                trialType: TrialType.AiAgent,
            }
            const userEventSetup = user.setup()
            render(<TrialOptOutModal {...aiAgentProps} />)

            const optOutButton = screen.getByRole('button', {
                name: 'Opt Out Anyway',
            })
            await userEventSetup.click(optOutButton)

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
                    trialType: TrialType.ShoppingAssistant,
                },
            )
            expect(mockOnClose).toHaveBeenCalled()
        })
    })

    describe('when isTrialExtended is true', () => {
        const extendedTrialProps = {
            ...defaultProps,
            isTrialExtended: true,
        }

        it('should show Dismiss button instead of Request Trial Extension', () => {
            render(<TrialOptOutModal {...extendedTrialProps} />)

            expect(
                screen.getByRole('button', { name: 'Dismiss' }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', {
                    name: 'Request Trial Extension',
                }),
            ).not.toBeInTheDocument()
        })

        it('should call onClose when Dismiss button is clicked', async () => {
            const userEventSetup = user.setup()
            render(<TrialOptOutModal {...extendedTrialProps} />)

            const dismissButton = screen.getByRole('button', {
                name: 'Dismiss',
            })
            await userEventSetup.click(dismissButton)

            expect(mockOnClose).toHaveBeenCalled()
        })

        it('should still disable button when isTrialExtended is true if canRequestTrialExtension is false', () => {
            mockCanRequestTrialExtension.mockReturnValue(false)
            render(<TrialOptOutModal {...extendedTrialProps} />)

            const dismissButton = screen.getByRole('button', {
                name: 'Dismiss',
            })
            expect(dismissButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('button IDs', () => {
        it('should set correct IDs for Shopping Assistant buttons', () => {
            render(<TrialOptOutModal {...defaultProps} />)

            const optOutButton = screen.getByRole('button', {
                name: 'Opt Out Anyway',
            })
            const extensionButton = screen.getByRole('button', {
                name: 'Request Trial Extension',
            })

            expect(optOutButton).toHaveAttribute(
                'id',
                'shopping-assistant-opt-out-button',
            )
            expect(extensionButton).toHaveAttribute(
                'id',
                'shopping-assistant-request-trial-extension-button',
            )
        })

        it('should set correct IDs for AI Agent buttons', () => {
            const aiAgentProps = {
                ...defaultProps,
                trialType: TrialType.AiAgent,
            }
            render(<TrialOptOutModal {...aiAgentProps} />)

            const optOutButton = screen.getByRole('button', {
                name: 'Opt Out Anyway',
            })
            const extensionButton = screen.getByRole('button', {
                name: 'Request Trial Extension',
            })

            expect(optOutButton).toHaveAttribute(
                'id',
                'ai-agent-opt-out-button',
            )
            expect(extensionButton).toHaveAttribute(
                'id',
                'ai-agent-request-trial-extension-button',
            )
        })
    })

    describe('notification messages', () => {
        it('should dispatch notification for Shopping Assistant opt out', async () => {
            const userEventSetup = user.setup()
            render(<TrialOptOutModal {...defaultProps} />)

            const optOutButton = screen.getByRole('button', {
                name: 'Opt Out Anyway',
            })
            await userEventSetup.click(optOutButton)

            const onSuccessCallback = mockMutate.mock.calls[0][1].onSuccess
            onSuccessCallback()

            expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function))
        })

        it('should dispatch notification for AI Agent opt out', async () => {
            const aiAgentProps = {
                ...defaultProps,
                trialType: TrialType.AiAgent,
            }
            const userEventSetup = user.setup()
            render(<TrialOptOutModal {...aiAgentProps} />)

            const optOutButton = screen.getByRole('button', {
                name: 'Opt Out Anyway',
            })
            await userEventSetup.click(optOutButton)

            const onSuccessCallback = mockMutate.mock.calls[0][1].onSuccess
            onSuccessCallback()

            expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function))
        })
    })

    describe('intro text logic', () => {
        describe('with Shopping Assistant trial type', () => {
            it('should show single store intro text when no Shopify integrations', () => {
                mockUseAppSelector.mockReturnValue([])
                render(<TrialOptOutModal {...defaultProps} />)

                expect(
                    screen.getByText(
                        /keep full access to the Shopping Assistant until then/,
                    ),
                ).toBeInTheDocument()
                expect(screen.getByText(/If you opt out/)).toBeInTheDocument()
                expect(
                    screen.queryByText(/on all your stores/),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText(
                        /lose AI Agent access across all stores/,
                    ),
                ).not.toBeInTheDocument()
            })

            it('should show single store intro text when only one Shopify integration', () => {
                mockUseAppSelector.mockReturnValue([{ id: 1, name: 'Store 1' }])
                render(<TrialOptOutModal {...defaultProps} />)

                expect(
                    screen.getByText(
                        /keep full access to the Shopping Assistant until then/,
                    ),
                ).toBeInTheDocument()
                expect(screen.getByText(/If you opt out/)).toBeInTheDocument()
                expect(
                    screen.queryByText(/on all your stores/),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText(
                        /lose AI Agent access across all stores/,
                    ),
                ).not.toBeInTheDocument()
            })

            it('should show single store intro text when multiple Shopify integrations for Shopping Assistant', () => {
                mockUseAppSelector.mockReturnValue([
                    { id: 1, name: 'Store 1' },
                    { id: 2, name: 'Store 2' },
                ])
                render(<TrialOptOutModal {...defaultProps} />)

                expect(
                    screen.getByText(
                        /keep full access to the Shopping Assistant until then/,
                    ),
                ).toBeInTheDocument()
                expect(screen.getByText(/If you opt out/)).toBeInTheDocument()
                expect(
                    screen.queryByText(/on all your stores/),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText(
                        /lose AI Agent access across all stores/,
                    ),
                ).not.toBeInTheDocument()
            })
        })

        describe('with AI Agent trial type', () => {
            const aiAgentProps = {
                ...defaultProps,
                trialType: TrialType.AiAgent,
            }

            it('should show single store intro text when no Shopify integrations', () => {
                mockUseAppSelector.mockReturnValue([])
                render(<TrialOptOutModal {...aiAgentProps} />)

                expect(
                    screen.getByText(
                        /keep full access to the AI Agent until then/,
                    ),
                ).toBeInTheDocument()
                expect(screen.getByText(/If you opt out/)).toBeInTheDocument()
                expect(
                    screen.queryByText(/on all your stores/),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText(
                        /lose AI Agent access across all stores/,
                    ),
                ).not.toBeInTheDocument()
            })

            it('should show single store intro text when only one Shopify integration', () => {
                mockUseAppSelector.mockReturnValue([{ id: 1, name: 'Store 1' }])
                render(<TrialOptOutModal {...aiAgentProps} />)

                expect(
                    screen.getByText(
                        /keep full access to the AI Agent until then/,
                    ),
                ).toBeInTheDocument()
                expect(screen.getByText(/If you opt out/)).toBeInTheDocument()
                expect(
                    screen.queryByText(/on all your stores/),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText(
                        /lose AI Agent access across all stores/,
                    ),
                ).not.toBeInTheDocument()
            })

            it('should show multi-store intro text when multiple Shopify integrations', () => {
                mockUseAppSelector.mockReturnValue([
                    { id: 1, name: 'Store 1' },
                    { id: 2, name: 'Store 2' },
                ])
                render(<TrialOptOutModal {...aiAgentProps} />)

                expect(
                    screen.getByText(
                        /keep full access to the AI Agent on all your stores until then/,
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(/lose AI Agent access across all stores/),
                ).toBeInTheDocument()
                expect(
                    screen.queryByText(/If you opt out/),
                ).not.toBeInTheDocument()
            })
        })
    })
})
