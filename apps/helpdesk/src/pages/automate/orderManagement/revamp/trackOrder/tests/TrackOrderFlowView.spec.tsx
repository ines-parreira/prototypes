import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createPortal } from 'react-dom'
import { useParams } from 'react-router-dom'

import { TicketChannel } from 'business/types/ticket'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { selfServiceConfiguration1 } from 'fixtures/self_service_configurations'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useChatPreviewPanel } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import useTrackOrderFlow from '../../../legacy/trackOrder/hooks/useTrackOrderFlow'
import { TrackOrderFlowView } from '../TrackOrderFlowView'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

jest.mock('../../../legacy/trackOrder/hooks/useTrackOrderFlow')
jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
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
const mockUseChatPreviewPanel = useChatPreviewPanel as jest.MockedFunction<
    typeof useChatPreviewPanel
>

const mockHandleTrackOrderFlowUpdate = jest.fn()
const mockShowPreviewPanel = jest.fn()

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
        mockUseChatPreviewPanel.mockReturnValue({
            showPreviewPanel: mockShowPreviewPanel,
            chatPreviewPortal: createPortal(
                <div data-testid="chat-preview-portal" />,
                document.body,
            ),
            hidePreviewPanel: jest.fn(),
            openChat: jest.fn(),
            closeChat: jest.fn(),
            displayPage: jest.fn(),
            updateMainColor: jest.fn(),
            updatePosition: jest.fn(),
            updateHeaderPictureUrl: jest.fn(),
            updateLauncher: jest.fn(),
            updateTexts: jest.fn(),
            updateLegalDisclaimer: jest.fn(),
            updateLegalDisclaimerEnabled: jest.fn(),
            updateWorkflowEntryPoints: jest.fn(),
            reloadPreview: jest.fn(),
            updateAvatarSettings: jest.fn(),
            updateQuickReplies: jest.fn(),
            updatePreviewOrders: jest.fn(),
        } satisfies ReturnType<typeof useChatPreviewPanel>)
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
        it('renders the chat preview portal', () => {
            render(<TrackOrderFlowView />)

            expect(
                screen.getByTestId('chat-preview-portal'),
            ).toBeInTheDocument()
        })

        it('calls useChatPreviewPanel with "track" as initialPage and track order preview data', () => {
            render(<TrackOrderFlowView />)

            expect(mockUseChatPreviewPanel).toHaveBeenCalledWith(
                expect.objectContaining({
                    headerActions: expect.anything(),
                    locale: undefined,
                    initialPage: 'track',
                    previewOrders: expect.objectContaining({
                        orders: expect.any(Object),
                        tracking: expect.any(Object),
                        flows: expect.objectContaining({ track_order: true }),
                    }),
                }),
            )
        })

        it('calls showPreviewPanel with the appId of the first chat channel', () => {
            render(<TrackOrderFlowView />)

            expect(mockShowPreviewPanel).toHaveBeenCalledWith('test-app-id-123')
        })

        it('calls showPreviewPanel with null when there are no chat channels', () => {
            mockUseSelfServiceChatChannels.mockReturnValue([])

            render(<TrackOrderFlowView />)

            expect(mockShowPreviewPanel).toHaveBeenCalledWith(null)
        })
    })
})
