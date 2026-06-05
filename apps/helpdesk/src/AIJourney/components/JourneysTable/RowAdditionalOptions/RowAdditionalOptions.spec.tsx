import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { JourneyStatusEnum, JourneyTypeEnum } from '@gorgias/convert-client'
import type { JourneyApiDTO } from '@gorgias/convert-client'

import { CUSTOM_JOURNEY_TYPE, STEPS_NAMES } from 'AIJourney/constants'
import { useJourneyUpdateHandler } from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'
import { useDeleteJourney } from 'AIJourney/queries/useDeleteJourney/useDeleteJourney'

import { RowAdditionalOptions } from './RowAdditionalOptions'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiJourneyCustomFlowEnabled: 'ai-journey-custom-flow-enabled',
    },
    useFlag: jest.fn(),
}))

jest.mock('AIJourney/hooks')
jest.mock('AIJourney/providers')
jest.mock('AIJourney/queries/useDeleteJourney/useDeleteJourney')

const mockUseJourneyUpdateHandler =
    useJourneyUpdateHandler as jest.MockedFunction<
        typeof useJourneyUpdateHandler
    >
const mockUseJourneyContext = useJourneyContext as jest.MockedFunction<
    typeof useJourneyContext
>
const mockUseFlag = require('@repo/feature-flags').useFlag as jest.Mock
const mockUseDeleteJourney = useDeleteJourney as jest.MockedFunction<
    typeof useDeleteJourney
>

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

describe('<RowAdditionalOptions />', () => {
    const mockHandleUpdate = jest.fn()
    const mockMutateAsync = jest.fn()

    const mockJourneyRowData: JourneyApiDTO = {
        id: 'journey-123',
        state: JourneyStatusEnum.Draft,
        message_instructions: 'Preview instructions',
        store_name: 'test-shop',
        type: JourneyTypeEnum.CartAbandoned,
        created_datetime: '2024-01-01T00:00:00Z',
        store_integration_id: 100,
        account_id: 1,
        store_type: 'shopify',
    }

    const mockCurrentIntegration = {
        id: 100,
        type: 'sms',
        name: 'Preview Integration',
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockImplementation((key: string) => {
            if (
                key ===
                require('@repo/feature-flags').FeatureFlagKey
                    .AiJourneyCustomFlowEnabled
            )
                return true
            return false
        })
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: mockCurrentIntegration,
        } as ReturnType<typeof useJourneyContext>)
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
            isSuccess: false,
        })
        mockHandleUpdate.mockResolvedValue(undefined)
        mockMutateAsync.mockResolvedValue(undefined)
        mockUseDeleteJourney.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isLoading: false,
        } as unknown as ReturnType<typeof useDeleteJourney>)
    })

    describe('Options visibility based on journey state', () => {
        it('should show Edit option for Draft state', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        state: JourneyStatusEnum.Draft,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            expect(trigger).toBeInTheDocument()

            await act(() => user.click(trigger))
            expect(screen.getAllByText('Edit').length).toBeGreaterThan(0)
        })

        it('should show Edit, Preview, Activation, and Pause options for Active state', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        state: JourneyStatusEnum.Active,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            expect(screen.getAllByText('Edit').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Preview').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Activation').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Pause').length).toBeGreaterThan(0)
        })

        it('should show Edit, Preview, Activation, and Play options for Paused state', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        state: JourneyStatusEnum.Paused,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            expect(screen.getAllByText('Edit').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Preview').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Activation').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Play').length).toBeGreaterThan(0)
        })
    })

    describe('Action handlers - Navigation', () => {
        it('should navigate to setup page when Edit option is clicked', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        state: JourneyStatusEnum.Active,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const editOptions = screen.getAllByText('Edit')
            const editListItem = editOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (editListItem) {
                await act(() => user.click(editListItem))
            }

            expect(mockHistoryPush).toHaveBeenCalledWith(
                `/app/ai-journey/test-shop/cart-abandoned/${STEPS_NAMES.SETUP}/journey-123`,
            )
        })

        it('should navigate to preview page when Preview option is clicked', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        state: JourneyStatusEnum.Active,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const testOptions = screen.getAllByText('Preview')
            const testListItem = testOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (testListItem) {
                await act(() => user.click(testListItem))
            }

            expect(mockHistoryPush).toHaveBeenCalledWith(
                `/app/ai-journey/test-shop/cart-abandoned/${STEPS_NAMES.PREVIEW}/journey-123`,
            )
        })

        it('should navigate to activation page when Activation option is clicked', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        state: JourneyStatusEnum.Active,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const activationOptions = screen.getAllByText('Activation')
            const activationListItem = activationOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (activationListItem) {
                await act(() => user.click(activationListItem))
            }

            expect(mockHistoryPush).toHaveBeenCalledWith(
                `/app/ai-journey/test-shop/cart-abandoned/${STEPS_NAMES.ACTIVATE}/journey-123`,
            )
        })
    })

    describe('Action handlers - Journey state updates', () => {
        it('should call handleUpdate with Paused state when Pause option is clicked', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        state: JourneyStatusEnum.Active,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const pauseOptions = screen.getAllByText('Pause')
            const pauseListItem = pauseOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (pauseListItem) {
                await act(() => user.click(pauseListItem))
            }

            expect(mockHandleUpdate).toHaveBeenCalledWith({
                journeyState: JourneyStatusEnum.Paused,
                journeyMessageInstructions: 'Preview instructions',
            })
        })

        it('should call handleUpdate with Active state when Play option is clicked', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        state: JourneyStatusEnum.Paused,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const playOptions = screen.getAllByText('Play')
            const playListItem = playOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (playListItem) {
                await act(() => user.click(playListItem))
            }

            expect(mockHandleUpdate).toHaveBeenCalledWith({
                journeyState: JourneyStatusEnum.Active,
                journeyMessageInstructions: 'Preview instructions',
            })
        })
    })

    describe('Error handling', () => {
        it('should dispatch error notification when handleUpdate fails', async () => {
            const error = new Error('Update failed')
            mockHandleUpdate.mockRejectedValue(error)

            const user = userEvent.setup()
            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        state: JourneyStatusEnum.Active,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const pauseOptions = screen.getAllByText('Pause')
            const pauseListItem = pauseOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (pauseListItem) {
                await act(() => user.click(pauseListItem))
            }

            const toastEl = await screen.findByRole('status', {
                name: 'Error updating journey: Error: Update failed',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })
    })

    describe('Integration context', () => {
        it('should use integration ID from context', async () => {
            const user = userEvent.setup()
            mockUseJourneyContext.mockReturnValue({
                currentIntegration: { id: 200 },
            } as ReturnType<typeof useJourneyContext>)

            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        state: JourneyStatusEnum.Active,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const pauseOptions = screen.getAllByText('Pause')
            const pauseListItem = pauseOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (pauseListItem) {
                await act(() => user.click(pauseListItem))
            }

            expect(mockUseJourneyUpdateHandler).toHaveBeenCalledWith({
                integrationId: 200,
                journeyId: 'journey-123',
            })
        })

        it('should handle missing integration gracefully', () => {
            mockUseJourneyContext.mockReturnValue({
                currentIntegration: undefined,
            } as ReturnType<typeof useJourneyContext>)

            const { container } = render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        state: JourneyStatusEnum.Active,
                    }}
                />,
            )

            expect(mockUseJourneyUpdateHandler).toHaveBeenCalledWith({
                integrationId: 0,
                journeyId: 'journey-123',
            })
            expect(container.firstChild).toBeInTheDocument()
        })
    })

    describe('Journey types', () => {
        it('should navigate with correct path for PostPurchase journey type', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        type: JourneyTypeEnum.PostPurchase,
                        state: JourneyStatusEnum.Active,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const editOptions = screen.getAllByText('Edit')
            const editListItem = editOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (editListItem) {
                await act(() => user.click(editListItem))
            }

            expect(mockHistoryPush).toHaveBeenCalledWith(
                `/app/ai-journey/test-shop/post-purchase/${STEPS_NAMES.SETUP}/journey-123`,
            )
        })

        it('should navigate with correct path for Welcome journey type', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        type: JourneyTypeEnum.Welcome,
                        state: JourneyStatusEnum.Active,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const editOptions = screen.getAllByText('Edit')
            const editListItem = editOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (editListItem) {
                await act(() => user.click(editListItem))
            }

            expect(mockHistoryPush).toHaveBeenCalledWith(
                `/app/ai-journey/test-shop/welcome/${STEPS_NAMES.SETUP}/journey-123`,
            )
        })

        it('should navigate with correct path for WinBack journey type', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        type: JourneyTypeEnum.WinBack,
                        state: JourneyStatusEnum.Active,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const editOptions = screen.getAllByText('Edit')
            const editListItem = editOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (editListItem) {
                await act(() => user.click(editListItem))
            }

            expect(mockHistoryPush).toHaveBeenCalledWith(
                `/app/ai-journey/test-shop/win-back/${STEPS_NAMES.SETUP}/journey-123`,
            )
        })
    })

    describe('Message instructions', () => {
        it('should pass message instructions when updating journey state', async () => {
            const user = userEvent.setup()
            const customInstructions = 'Custom message instructions'
            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        message_instructions: customInstructions,
                        state: JourneyStatusEnum.Active,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const pauseOptions = screen.getAllByText('Pause')
            const pauseListItem = pauseOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (pauseListItem) {
                await act(() => user.click(pauseListItem))
            }

            expect(mockHandleUpdate).toHaveBeenCalledWith({
                journeyState: JourneyStatusEnum.Paused,
                journeyMessageInstructions: customInstructions,
            })
        })

        it('should handle null message instructions', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        message_instructions: null,
                        state: JourneyStatusEnum.Paused,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const playOptions = screen.getAllByText('Play')
            const playListItem = playOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (playListItem) {
                await act(() => user.click(playListItem))
            }

            expect(mockHandleUpdate).toHaveBeenCalledWith({
                journeyState: JourneyStatusEnum.Active,
                journeyMessageInstructions: null,
            })
        })
    })

    describe('Custom flow rows', () => {
        const mockCustomFlowRowData = {
            id: 'custom-flow-123',
            state: JourneyStatusEnum.Draft,
            message_instructions: null,
            store_name: 'test-shop',
            type: CUSTOM_JOURNEY_TYPE as JourneyTypeEnum,
            name: 'My Webhook Flow',
            created_datetime: '2024-01-01T00:00:00Z',
            store_integration_id: 100,
            account_id: 1,
            store_type: 'shopify',
        }

        it('should show Edit and Delete options for custom flow', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions journeyRowData={mockCustomFlowRowData} />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            expect(screen.getAllByText('Edit').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Delete').length).toBeGreaterThan(0)
        })

        it('should not show Pause or Play options for custom flow', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions journeyRowData={mockCustomFlowRowData} />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            expect(screen.queryByText('Pause')).not.toBeInTheDocument()
            expect(screen.queryByText('Play')).not.toBeInTheDocument()
        })

        it('should not show Preview or Activation options for custom flow', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions journeyRowData={mockCustomFlowRowData} />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            expect(screen.queryByText('Preview')).not.toBeInTheDocument()
            expect(screen.queryByText('Activation')).not.toBeInTheDocument()
        })

        it('should show confirmation dialog when Delete option is clicked', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions journeyRowData={mockCustomFlowRowData} />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const deleteOptions = screen.getAllByText('Delete')
            const deleteListItem = deleteOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (deleteListItem) {
                await act(() => user.click(deleteListItem))
            }

            await waitFor(() => {
                expect(
                    screen.getByText('Delete My Webhook Flow?'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        'This will permanently remove the flow and its webhook URL. This cannot be undone.',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('should call DELETE API when delete is confirmed', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions journeyRowData={mockCustomFlowRowData} />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const deleteOptions = screen.getAllByText('Delete')
            const deleteListItem = deleteOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (deleteListItem) {
                await act(() => user.click(deleteListItem))
            }

            await waitFor(() => {
                expect(
                    screen.getByText('Delete My Webhook Flow?'),
                ).toBeInTheDocument()
            })

            const confirmButton = screen.getByRole('button', {
                name: /^delete$/i,
            })
            await user.click(confirmButton)

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith({
                    id: 'custom-flow-123',
                })
            })
        })

        it('should not call DELETE API when delete is cancelled', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions journeyRowData={mockCustomFlowRowData} />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const deleteOptions = screen.getAllByText('Delete')
            const deleteListItem = deleteOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (deleteListItem) {
                await act(() => user.click(deleteListItem))
            }

            await waitFor(() => {
                expect(
                    screen.getByText('Delete My Webhook Flow?'),
                ).toBeInTheDocument()
            })

            const cancelButton = screen.getByRole('button', { name: /cancel/i })
            await user.click(cancelButton)

            expect(mockMutateAsync).not.toHaveBeenCalled()
        })

        it('should dispatch error toast when DELETE returns 422', async () => {
            const apiError = {
                isAxiosError: true,
                response: {
                    status: 422,
                    data: {
                        error: { msg: 'Built-in flows cannot be deleted.' },
                    },
                },
            }
            mockMutateAsync.mockRejectedValue(apiError)

            const user = userEvent.setup()
            render(
                <RowAdditionalOptions journeyRowData={mockCustomFlowRowData} />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const deleteOptions = screen.getAllByText('Delete')
            const deleteListItem = deleteOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (deleteListItem) {
                await act(() => user.click(deleteListItem))
            }

            await waitFor(() => {
                expect(
                    screen.getByText('Delete My Webhook Flow?'),
                ).toBeInTheDocument()
            })

            const confirmButton = screen.getByRole('button', {
                name: /^delete$/i,
            })
            await act(() => user.click(confirmButton))

            const toastEl = await screen.findByRole('status', {
                name: 'Built-in flows cannot be deleted.',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })

        it('should disable delete confirm button while deletion is pending', async () => {
            mockMutateAsync.mockImplementation(
                () => new Promise(() => {}), // never resolves
            )

            const user = userEvent.setup()
            mockUseDeleteJourney.mockReturnValue({
                mutateAsync: mockMutateAsync,
                isLoading: true,
            } as unknown as ReturnType<typeof useDeleteJourney>)

            render(
                <RowAdditionalOptions journeyRowData={mockCustomFlowRowData} />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const deleteOptions = screen.getAllByText('Delete')
            const deleteListItem = deleteOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (deleteListItem) {
                await act(() => user.click(deleteListItem))
            }

            await waitFor(() => {
                expect(
                    screen.getByText('Delete My Webhook Flow?'),
                ).toBeInTheDocument()
            })

            const dialog = screen.getByRole('dialog')
            const confirmButton = dialog.querySelector(
                'button[data-pending="true"]',
            )
            expect(confirmButton).toBeInTheDocument()
            expect(confirmButton).toBeDisabled()
        })

        it('should dispatch generic error toast when DELETE fails with non-API error', async () => {
            const genericError = new Error('Network error')
            mockMutateAsync.mockRejectedValue(genericError)

            const user = userEvent.setup()
            render(
                <RowAdditionalOptions journeyRowData={mockCustomFlowRowData} />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            const deleteOptions = screen.getAllByText('Delete')
            const deleteListItem = deleteOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (deleteListItem) {
                await act(() => user.click(deleteListItem))
            }

            await waitFor(() => {
                expect(
                    screen.getByText('Delete My Webhook Flow?'),
                ).toBeInTheDocument()
            })

            const confirmButton = screen.getByRole('button', {
                name: /^delete$/i,
            })
            await act(() => user.click(confirmButton))

            const toastEl = await screen.findByRole('status', {
                name: 'Failed to delete flow.',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })
    })

    describe('Built-in flow rows', () => {
        it('should not render Delete for CartAbandoned flow', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        type: JourneyTypeEnum.CartAbandoned,
                        state: JourneyStatusEnum.Active,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            expect(screen.queryByText('Delete')).not.toBeInTheDocument()
        })

        it('should not render Delete for SessionAbandoned flow', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        type: JourneyTypeEnum.SessionAbandoned,
                        state: JourneyStatusEnum.Active,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            expect(screen.queryByText('Delete')).not.toBeInTheDocument()
        })

        it('should not render Delete for WinBack flow', async () => {
            const user = userEvent.setup()
            render(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        type: JourneyTypeEnum.WinBack,
                        state: JourneyStatusEnum.Active,
                    }}
                />,
            )

            const trigger = screen.getByLabelText('Open options')
            await act(() => user.click(trigger))

            expect(screen.queryByText('Delete')).not.toBeInTheDocument()
        })
    })
})
