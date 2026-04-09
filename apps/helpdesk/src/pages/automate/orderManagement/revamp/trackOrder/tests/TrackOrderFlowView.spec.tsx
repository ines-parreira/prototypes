import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useParams } from 'react-router-dom'

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

jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels', () => ({
    __esModule: true,
    default: jest.fn(() => []),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
    () => ({
        useChatPreviewPanel: jest.fn(() => ({
            showPreviewPanel: jest.fn(),
            chatPreviewPortal: null,
        })),
    }),
)

jest.mock(
    'pages/automate/connectedChannels/revamp/components/ChatChannelSelector/ChatChannelSelector',
    () => ({
        ChatChannelSelector: () => <div>ChatChannelSelector</div>,
    }),
)

const mockUseSelfServiceChatChannels =
    useSelfServiceChatChannels as jest.MockedFunction<
        typeof useSelfServiceChatChannels
    >
const mockUseChatPreviewPanel = useChatPreviewPanel as jest.MockedFunction<
    typeof useChatPreviewPanel
>

const mockChatChannel = {
    type: 'chat' as const,
    value: {
        id: 1,
        meta: {
            app_id: 'test-app-id',
            languages: [{ language: 'en', primary: true }],
        },
    },
} as any

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
const mockHandleTrackOrderFlowUpdate = jest.fn()

describe('TrackOrderFlowView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseParams.mockReturnValue({ shopName: 'test-store' })
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

    it('should initialize the chat preview panel when channels are available', () => {
        const mockShowPreviewPanel = jest.fn()
        mockUseSelfServiceChatChannels.mockReturnValue([mockChatChannel])
        mockUseChatPreviewPanel.mockReturnValue({
            showPreviewPanel: mockShowPreviewPanel,
            chatPreviewPortal: null,
        } as any)

        render(<TrackOrderFlowView />)

        expect(mockShowPreviewPanel).toHaveBeenCalledWith('test-app-id')
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
})
