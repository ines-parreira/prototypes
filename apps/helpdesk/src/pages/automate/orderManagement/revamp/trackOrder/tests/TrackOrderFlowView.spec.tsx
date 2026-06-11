import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useParams } from 'react-router-dom'

import { TicketChannel } from 'business/types/ticket'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { selfServiceConfiguration1 } from 'fixtures/self_service_configurations'
import { useSelfServiceChatChannels } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import { useTrackOrderFlow } from '../../../legacy/trackOrder/hooks/useTrackOrderFlow'
import { TrackOrderFlowView } from '../TrackOrderFlowView'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

jest.mock('../../../legacy/trackOrder/hooks/useTrackOrderFlow')
jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
)

jest.mock(
    '../../components/OrderManagementFlowHeader/OrderManagementFlowHeader',
    () => ({
        OrderManagementFlowHeader: ({
            onSave,
            isSaveDisabled,
        }: {
            onSave: () => void
            isSaveDisabled: boolean
        }) => (
            <button onClick={onSave} disabled={isSaveDisabled}>
                Save
            </button>
        ),
    }),
)

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
const mockUseTrackOrderFlow = useTrackOrderFlow as jest.MockedFunction<
    typeof useTrackOrderFlow
>
const mockUseSelfServiceChatChannels =
    useSelfServiceChatChannels as jest.MockedFunction<
        typeof useSelfServiceChatChannels
    >

const mockHandleTrackOrderFlowUpdate = jest.fn()

const mockUpdatePreviewOrders = jest.fn()
const mockDisplayPage = jest.fn()
const mockOnChatPreviewLoaded = jest.fn()
const mockUseChatPreviewPanelContext =
    useChatPreviewPanelContext as jest.MockedFunction<
        typeof useChatPreviewPanelContext
    >

const mockChatChannel = {
    type: TicketChannel.Chat,
    value: {
        ...chatIntegrationFixtures[0],
        meta: { ...chatIntegrationFixtures[0].meta, app_id: 'test-app-id-123' },
    },
} satisfies ReturnType<typeof useSelfServiceChatChannels>[number]

describe('TrackOrderFlowView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseParams.mockReturnValue({
            shopName: 'test-store',
            shopType: 'shopify',
        })
        mockUseSelfServiceChatChannels.mockReturnValue([mockChatChannel])
        mockOnChatPreviewLoaded.mockReturnValue(jest.fn())
        mockUseChatPreviewPanelContext.mockReturnValue({
            updatePreviewOrders: mockUpdatePreviewOrders,
            displayPage: mockDisplayPage,
            onChatPreviewLoaded: mockOnChatPreviewLoaded,
        } as any)
        mockUseTrackOrderFlow.mockReturnValue({
            trackOrderFlow: {
                ...selfServiceConfiguration1.trackOrderPolicy,
                unfulfilledMessage: { text: '', html: '' },
            },
            isUpdatePending: false,
            selfServiceConfiguration: selfServiceConfiguration1,
            storeIntegration: undefined,
            handleTrackOrderFlowUpdate: mockHandleTrackOrderFlowUpdate,
        })
    })

    it('should render loading state when data is not yet available', () => {
        mockUseTrackOrderFlow.mockReturnValue({
            trackOrderFlow: undefined,
            isUpdatePending: false,
            selfServiceConfiguration: undefined,
            storeIntegration: undefined,
            handleTrackOrderFlowUpdate: mockHandleTrackOrderFlowUpdate,
        })

        render(<TrackOrderFlowView />)

        expect(
            screen.queryByText('Response for unfulfilled orders'),
        ).not.toBeInTheDocument()
    })

    it('should render the configuration form when data is loaded', () => {
        render(<TrackOrderFlowView />)

        expect(
            screen.getByText('Response for unfulfilled orders'),
        ).toBeInTheDocument()
        expect(screen.getByRole('textbox')).toBeInTheDocument()
        expect(
            screen.getByText(/Display a custom message/i),
        ).toBeInTheDocument()
    })

    it('should disable Save button when form is not dirty', () => {
        render(<TrackOrderFlowView />)

        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('should enable Save button after modifying the textarea', async () => {
        const user = userEvent.setup()
        render(<TrackOrderFlowView />)

        await user.type(screen.getByRole('textbox'), 'custom message')

        expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    })

    it('should call handleTrackOrderFlowUpdate with the updated message on save', async () => {
        const user = userEvent.setup()
        render(<TrackOrderFlowView />)

        await user.type(screen.getByRole('textbox'), 'custom message')
        await user.click(screen.getByRole('button', { name: 'Save' }))

        expect(mockHandleTrackOrderFlowUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                unfulfilledMessage: {
                    text: 'custom message',
                    html: 'custom message',
                },
            }),
        )
    })

    describe('chat preview panel', () => {
        it('should call updatePreviewOrders with initial preview orders on mount', () => {
            render(<TrackOrderFlowView />)

            expect(mockUpdatePreviewOrders).toHaveBeenCalledWith(
                expect.objectContaining({
                    orders: expect.objectContaining({
                        '#1001': expect.objectContaining({ name: '#1001' }),
                    }),
                }),
            )
        })

        it('should register a callback with onChatPreviewLoaded that fires immediately if already loaded', () => {
            render(<TrackOrderFlowView />)

            expect(mockOnChatPreviewLoaded).toHaveBeenCalledWith(
                expect.any(Function),
                true,
            )
        })

        it('should call updatePreviewOrders and displayPage when onChatPreviewLoaded callback fires', () => {
            let capturedCallback!: () => void
            mockOnChatPreviewLoaded.mockImplementation((callback) => {
                capturedCallback = callback
                return jest.fn()
            })

            render(<TrackOrderFlowView />)
            mockUpdatePreviewOrders.mockClear()
            capturedCallback()

            expect(mockUpdatePreviewOrders).toHaveBeenCalledWith(
                expect.objectContaining({
                    orders: expect.objectContaining({
                        '#1001': expect.objectContaining({ name: '#1001' }),
                    }),
                }),
            )
            expect(mockDisplayPage).toHaveBeenCalledWith('track', {
                orderName: '#1001',
            })
        })

        it('should update preview orders with the new unfulfilledMessage when the form changes', async () => {
            const user = userEvent.setup()
            render(<TrackOrderFlowView />)

            mockUpdatePreviewOrders.mockClear()
            await user.type(screen.getByRole('textbox'), 'custom message')

            expect(mockUpdatePreviewOrders).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    orders: {
                        '#1001': expect.objectContaining({
                            fulfillments: [
                                expect.objectContaining({
                                    flows: expect.objectContaining({
                                        track_order_unfulfilled_message: {
                                            html: 'custom message',
                                            text: 'custom message',
                                        },
                                    }),
                                }),
                            ],
                        }),
                    },
                }),
            )
        })

        it('should clean up the onChatPreviewLoaded subscription on unmount', () => {
            const mockCleanup = jest.fn()
            mockOnChatPreviewLoaded.mockReturnValue(mockCleanup)

            const { unmount } = render(<TrackOrderFlowView />)
            unmount()

            expect(mockCleanup).toHaveBeenCalled()
        })
    })
})
