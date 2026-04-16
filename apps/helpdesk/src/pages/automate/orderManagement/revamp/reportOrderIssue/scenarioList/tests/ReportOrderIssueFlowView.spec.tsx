import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useChatPreviewPanel } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import { useReportOrderIssueFlow } from '../hooks/useReportOrderIssueFlow'
import { ReportOrderIssueFlowView } from '../ReportOrderIssueFlowView'

const mockPush = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ shopName: 'my-store', shopType: 'shopify' }),
    useHistory: () => ({ push: mockPush }),
    useLocation: () => ({
        pathname:
            '/app/settings/order-management/shopify/my-store/report-issue',
    }),
}))

jest.mock('../hooks/useReportOrderIssueFlow')

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

jest.mock(
    '../../../components/OrderManagementFlowHeader/OrderManagementFlowHeader',
    () => ({
        OrderManagementFlowHeader: ({
            title,
            onSave,
            isSaveDisabled,
            isSaveLoading,
        }: {
            title: string
            onSave?: () => void
            isSaveDisabled?: boolean
            isSaveLoading?: boolean
        }) => (
            <div>
                <span>{title}</span>
                {onSave && (
                    <button
                        onClick={onSave}
                        disabled={isSaveDisabled}
                        aria-busy={isSaveLoading}
                    >
                        Save
                    </button>
                )}
            </div>
        ),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatCreationWizard/components/SaveChangesPrompt',
    () => ({
        __esModule: true,
        default: ({ when }: { when: boolean }) => (
            <div data-testid="save-changes-prompt" data-when={when} />
        ),
    }),
)

const listOnReorder = { current: undefined as ((s: any[]) => void) | undefined }

jest.mock('../ReportOrderIssueScenarioList', () => ({
    ReportOrderIssueScenarioList: ({
        onReorder,
    }: {
        onReorder: (scenarios: any[]) => void
    }) => {
        listOnReorder.current = onReorder
        return <div>ReportOrderIssueScenarioList</div>
    },
}))

const mockUseSelfServiceChatChannels =
    useSelfServiceChatChannels as jest.MockedFunction<
        typeof useSelfServiceChatChannels
    >
const mockUseChatPreviewPanel = useChatPreviewPanel as jest.MockedFunction<
    typeof useChatPreviewPanel
>
const mockUseReportOrderIssueFlow =
    useReportOrderIssueFlow as jest.MockedFunction<
        typeof useReportOrderIssueFlow
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

const mockScenario = {
    title: 'Wrong item',
    description: 'Received wrong item',
    conditions: { and: [] },
    newReasons: [],
}

const defaultFlowReturn = {
    isLoading: false,
    isUpdatePending: false,
    scenarios: [],
    handleScenariosUpdate: jest.fn(),
}

describe('ReportOrderIssueFlowView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        listOnReorder.current = undefined
        mockUseReportOrderIssueFlow.mockReturnValue(defaultFlowReturn)
    })

    it('should render the header with correct title', () => {
        render(<ReportOrderIssueFlowView />)

        expect(screen.getByText('Report order issue')).toBeInTheDocument()
    })

    it('should render the Create Scenario button', () => {
        render(<ReportOrderIssueFlowView />)

        expect(
            screen.getByRole('button', { name: 'Create Scenario' }),
        ).toBeInTheDocument()
    })

    it('should render the order label', () => {
        render(<ReportOrderIssueFlowView />)

        expect(
            screen.getByText('Scenarios apply in the order below'),
        ).toBeInTheDocument()
    })

    it('should navigate to the create view on Create Scenario click', async () => {
        const user = userEvent.setup()
        render(<ReportOrderIssueFlowView />)

        await user.click(
            screen.getByRole('button', { name: 'Create Scenario' }),
        )

        expect(mockPush).toHaveBeenCalledWith(
            '/app/settings/order-management/shopify/my-store/report-issue/new',
        )
    })

    it('should render the scenario list when not loading', () => {
        render(<ReportOrderIssueFlowView />)

        expect(
            screen.getByText('ReportOrderIssueScenarioList'),
        ).toBeInTheDocument()
    })

    it('should render skeletons when loading', () => {
        mockUseReportOrderIssueFlow.mockReturnValue({
            ...defaultFlowReturn,
            isLoading: true,
        })

        render(<ReportOrderIssueFlowView />)

        expect(
            screen.queryByText('ReportOrderIssueScenarioList'),
        ).not.toBeInTheDocument()
    })

    it('should render a disabled Save button when no changes have been made', () => {
        render(<ReportOrderIssueFlowView />)

        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('should enable the Save button after a reorder', () => {
        render(<ReportOrderIssueFlowView />)

        act(() => {
            listOnReorder.current?.([mockScenario])
        })

        expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    })

    it('should call handleScenariosUpdate with reordered scenarios on save', async () => {
        const user = userEvent.setup()
        const handleScenariosUpdate = jest.fn()
        mockUseReportOrderIssueFlow.mockReturnValue({
            ...defaultFlowReturn,
            handleScenariosUpdate,
        })

        render(<ReportOrderIssueFlowView />)

        act(() => {
            listOnReorder.current?.([mockScenario])
        })

        await user.click(screen.getByRole('button', { name: 'Save' }))

        expect(handleScenariosUpdate).toHaveBeenCalledWith([mockScenario])
    })

    it('should show loading state on Save button while update is pending', () => {
        mockUseReportOrderIssueFlow.mockReturnValue({
            ...defaultFlowReturn,
            isUpdatePending: true,
        })

        render(<ReportOrderIssueFlowView />)

        expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
            'aria-busy',
            'true',
        )
    })

    it('should not prompt for unsaved changes when the form is clean', () => {
        render(<ReportOrderIssueFlowView />)

        expect(screen.getByTestId('save-changes-prompt')).toHaveAttribute(
            'data-when',
            'false',
        )
    })

    it('should prompt for unsaved changes after a reorder', () => {
        render(<ReportOrderIssueFlowView />)

        act(() => {
            listOnReorder.current?.([mockScenario])
        })

        expect(screen.getByTestId('save-changes-prompt')).toHaveAttribute(
            'data-when',
            'true',
        )
    })

    it('should initialize the chat preview panel when channels are available', () => {
        const mockShowPreviewPanel = jest.fn()
        mockUseSelfServiceChatChannels.mockReturnValue([mockChatChannel])
        mockUseChatPreviewPanel.mockReturnValue({
            showPreviewPanel: mockShowPreviewPanel,
            chatPreviewPortal: null,
        } as any)

        render(<ReportOrderIssueFlowView />)

        expect(mockShowPreviewPanel).toHaveBeenCalledWith('test-app-id')
    })
})
