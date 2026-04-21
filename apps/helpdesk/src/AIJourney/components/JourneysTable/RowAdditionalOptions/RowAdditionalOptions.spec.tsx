import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { JourneyStatusEnum, JourneyTypeEnum } from '@gorgias/convert-client'
import type { JourneyApiDTO } from '@gorgias/convert-client'

import { STEPS_NAMES } from 'AIJourney/constants'
import {
    useAiJourneyStoreConfiguration,
    useJourneyUpdateHandler,
} from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { renderWithRouter } from 'utils/testing'

import { RowAdditionalOptions } from './RowAdditionalOptions'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiJourneyStoreSettingsEnabled: 'ai-journey-store-settings-enabled',
    },
    useFlag: jest.fn(),
}))

jest.mock('AIJourney/hooks')
jest.mock('AIJourney/providers')
jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')

const mockUseJourneyUpdateHandler =
    useJourneyUpdateHandler as jest.MockedFunction<
        typeof useJourneyUpdateHandler
    >
const mockUseAiJourneyStoreConfiguration =
    useAiJourneyStoreConfiguration as jest.MockedFunction<
        typeof useAiJourneyStoreConfiguration
    >
const mockUseJourneyContext = useJourneyContext as jest.MockedFunction<
    typeof useJourneyContext
>
const mockUseAppDispatch = useAppDispatch as jest.MockedFunction<
    typeof useAppDispatch
>
const mockNotify = notify as jest.MockedFunction<typeof notify>
const mockUseFlag = require('@repo/feature-flags').useFlag as jest.Mock

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

describe('<RowAdditionalOptions />', () => {
    const mockDispatch = jest.fn()
    const mockHandleUpdate = jest.fn()

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
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockNotify.mockReturnValue(() => Promise.resolve())
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: mockCurrentIntegration,
        } as any)
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
            isSuccess: false,
        })
        mockHandleUpdate.mockResolvedValue(undefined)
        mockUseFlag.mockReturnValue(false)
        mockUseAiJourneyStoreConfiguration.mockReturnValue({
            storeConfiguration: { sms_sender_integration_id: 123 },
            isLoading: false,
        } as any)
    })

    describe('Options visibility based on journey state', () => {
        it('should show Edit option for Draft state', async () => {
            const user = userEvent.setup()
            renderWithRouter(
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
            renderWithRouter(
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
            renderWithRouter(
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
            renderWithRouter(
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
            renderWithRouter(
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
            renderWithRouter(
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
            renderWithRouter(
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
            renderWithRouter(
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
            renderWithRouter(
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

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: 'Error updating journey: Error: Update failed',
                    status: NotificationStatus.Error,
                }),
            )
        })
    })

    describe('Integration context', () => {
        it('should use integration ID from context', async () => {
            const user = userEvent.setup()
            mockUseJourneyContext.mockReturnValue({
                currentIntegration: { id: 200 },
            } as any)

            renderWithRouter(
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
            } as any)

            const { container } = renderWithRouter(
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
            renderWithRouter(
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
            renderWithRouter(
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
            renderWithRouter(
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
            renderWithRouter(
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
            renderWithRouter(
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

    describe('SMS sender required modal', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
            mockUseAiJourneyStoreConfiguration.mockReturnValue({
                storeConfiguration: { sms_sender_integration_id: null },
                isLoading: false,
            } as any)
        })

        afterEach(() => {
            window.USER_IMPERSONATED = null
        })

        it('should open modal instead of navigating when Activation clicked and sender is missing', async () => {
            const user = userEvent.setup()
            renderWithRouter(
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

            expect(mockHistoryPush).not.toHaveBeenCalled()
            await waitFor(() => {
                expect(
                    screen.getByText('Add sender phone number'),
                ).toBeInTheDocument()
            })
        })

        it('should open modal instead of activating when Play clicked and sender is missing', async () => {
            const user = userEvent.setup()
            renderWithRouter(
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

            expect(mockHandleUpdate).not.toHaveBeenCalled()
            await waitFor(() => {
                expect(
                    screen.getByText('Add sender phone number'),
                ).toBeInTheDocument()
            })
        })

        it('should navigate normally when Activation clicked, sender missing, but USER_IMPERSONATED is true', async () => {
            window.USER_IMPERSONATED = true
            const user = userEvent.setup()
            renderWithRouter(
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

            expect(mockHistoryPush).toHaveBeenCalled()
            expect(
                screen.queryByText('Add sender phone number'),
            ).not.toBeInTheDocument()
        })

        it('should call handleUpdate normally when Play clicked, sender missing, but USER_IMPERSONATED is true', async () => {
            window.USER_IMPERSONATED = true
            const user = userEvent.setup()
            renderWithRouter(
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

            expect(mockHandleUpdate).toHaveBeenCalled()
            expect(
                screen.queryByText('Add sender phone number'),
            ).not.toBeInTheDocument()
        })

        it('should show flow text in modal for non-campaign journey type', async () => {
            const user = userEvent.setup()
            renderWithRouter(
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

            const activationOptions = screen.getAllByText('Activation')
            const activationListItem = activationOptions.find(
                (el) =>
                    el.closest('[role="option"]') ||
                    el.closest('.ui-text-text-d239'),
            )
            if (activationListItem) {
                await act(() => user.click(activationListItem))
            }

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Select a phone number in Settings to activate this flow.',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('should close the modal when Cancel is clicked', async () => {
            const user = userEvent.setup()
            renderWithRouter(
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

            await waitFor(() => {
                expect(
                    screen.getByText('Add sender phone number'),
                ).toBeInTheDocument()
            })

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            await act(() => user.click(cancelButton))

            await waitFor(() => {
                expect(
                    screen.queryByText('Add sender phone number'),
                ).not.toBeInTheDocument()
            })
        })

        it('should show campaign text in modal for campaign journey type', async () => {
            const user = userEvent.setup()
            renderWithRouter(
                <RowAdditionalOptions
                    journeyRowData={{
                        ...mockJourneyRowData,
                        type: JourneyTypeEnum.Campaign,
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

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Select a phone number in Settings to send this campaign.',
                    ),
                ).toBeInTheDocument()
            })
        })
    })
})
