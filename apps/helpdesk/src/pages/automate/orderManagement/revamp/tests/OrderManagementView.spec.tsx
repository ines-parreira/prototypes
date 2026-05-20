import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import type { OrderManagementFlow } from '../components/OrderManagementFlowsCard/useOrderManagementFlows'
import { useOrderManagementFlows } from '../components/OrderManagementFlowsCard/useOrderManagementFlows'
import { OrderManagementViewRevamp } from '../OrderManagementView'

jest.mock(
    '../components/OrderManagementFlowsCard/useOrderManagementFlows',
    () => ({
        useOrderManagementFlows: jest.fn(),
    }),
)

jest.mock(
    '../components/OrderManagementFlowsCard/OrderManagementFlowsCard',
    () => ({
        OrderManagementFlowsCard: () => <div>OrderManagementFlowsCard</div>,
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
    () => ({
        useChatPreviewPanelContext: jest.fn(),
    }),
)

const mockedUseOrderManagementFlows =
    useOrderManagementFlows as jest.MockedFunction<
        typeof useOrderManagementFlows
    >

const mockedUseChatPreviewPanelContext =
    useChatPreviewPanelContext as jest.MockedFunction<
        typeof useChatPreviewPanelContext
    >

const buildFlow = (
    key: OrderManagementFlow['key'],
    isEnabled: boolean,
): OrderManagementFlow => ({
    key,
    title: key,
    routePath: key,
    isEnabled,
    hasEmptyResponse: false,
    canNavigate: true,
})

const buildFlows = ({
    track = false,
    cancel = false,
    returnOrder = false,
    report = false,
}: {
    track?: boolean
    cancel?: boolean
    returnOrder?: boolean
    report?: boolean
}): OrderManagementFlow[] => [
    buildFlow('trackOrderPolicy', track),
    buildFlow('returnOrderPolicy', returnOrder),
    buildFlow('cancelOrderPolicy', cancel),
    buildFlow('reportIssuePolicy', report),
]

describe('OrderManagementViewRevamp', () => {
    const mockDisplayPage = jest.fn()
    const mockUpdateOrderManagementFlows = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseOrderManagementFlows.mockReturnValue({
            isLoading: false,
            isUpdatePending: false,
            flows: [],
            handleFlowToggle: jest.fn(),
            navigateToFlow: jest.fn(),
        })

        mockedUseChatPreviewPanelContext.mockReturnValue({
            displayPage: mockDisplayPage,
            updateOrderManagementFlows: mockUpdateOrderManagementFlows,
        } as unknown as ReturnType<typeof useChatPreviewPanelContext>)
    })

    it('should render the OrderManagementFlowsCard', () => {
        render(<OrderManagementViewRevamp />)

        expect(screen.getByText('OrderManagementFlowsCard')).toBeInTheDocument()
    })

    it('should call useOrderManagementFlows on mount', () => {
        render(<OrderManagementViewRevamp />)

        expect(useOrderManagementFlows).toHaveBeenCalled()
    })

    it('should call displayPage with "homepage" on mount', () => {
        render(<OrderManagementViewRevamp />)

        expect(mockDisplayPage).toHaveBeenCalledWith('homepage')
    })

    it('pushes the current flows payload on the first settled render', () => {
        mockedUseOrderManagementFlows.mockReturnValue({
            isLoading: false,
            isUpdatePending: false,
            flows: buildFlows({ track: true }),
            handleFlowToggle: jest.fn(),
            navigateToFlow: jest.fn(),
        })

        render(<OrderManagementViewRevamp />)

        expect(mockUpdateOrderManagementFlows).toHaveBeenCalledWith({
            track_order: true,
            return_order: false,
            cancel_order: false,
            report_issue: false,
        })
    })

    it('pushes the updated payload when individual flows toggle', () => {
        mockedUseOrderManagementFlows.mockReturnValue({
            isLoading: false,
            isUpdatePending: false,
            flows: buildFlows({ track: true }),
            handleFlowToggle: jest.fn(),
            navigateToFlow: jest.fn(),
        })

        const { rerender } = render(<OrderManagementViewRevamp />)

        mockedUseOrderManagementFlows.mockReturnValue({
            isLoading: false,
            isUpdatePending: false,
            flows: buildFlows({ track: true, cancel: true }),
            handleFlowToggle: jest.fn(),
            navigateToFlow: jest.fn(),
        })
        rerender(<OrderManagementViewRevamp />)

        expect(mockUpdateOrderManagementFlows).toHaveBeenLastCalledWith({
            track_order: true,
            return_order: false,
            cancel_order: true,
            report_issue: false,
        })
    })

    it('pushes when transitioning from no flows to any enabled', () => {
        const { rerender } = render(<OrderManagementViewRevamp />)

        mockedUseOrderManagementFlows.mockReturnValue({
            isLoading: false,
            isUpdatePending: false,
            flows: buildFlows({ track: true }),
            handleFlowToggle: jest.fn(),
            navigateToFlow: jest.fn(),
        })
        rerender(<OrderManagementViewRevamp />)

        expect(mockUpdateOrderManagementFlows).toHaveBeenLastCalledWith({
            track_order: true,
            return_order: false,
            cancel_order: false,
            report_issue: false,
        })
    })

    it('pushes when transitioning from any enabled to no flows', () => {
        mockedUseOrderManagementFlows.mockReturnValue({
            isLoading: false,
            isUpdatePending: false,
            flows: buildFlows({ track: true, cancel: true }),
            handleFlowToggle: jest.fn(),
            navigateToFlow: jest.fn(),
        })

        const { rerender } = render(<OrderManagementViewRevamp />)

        mockedUseOrderManagementFlows.mockReturnValue({
            isLoading: false,
            isUpdatePending: false,
            flows: buildFlows({}),
            handleFlowToggle: jest.fn(),
            navigateToFlow: jest.fn(),
        })
        rerender(<OrderManagementViewRevamp />)

        expect(mockUpdateOrderManagementFlows).toHaveBeenLastCalledWith({
            track_order: false,
            return_order: false,
            cancel_order: false,
            report_issue: false,
        })
    })

    it('skips pushing while the configuration is loading', () => {
        mockedUseOrderManagementFlows.mockReturnValue({
            isLoading: true,
            isUpdatePending: false,
            flows: [],
            handleFlowToggle: jest.fn(),
            navigateToFlow: jest.fn(),
        })

        render(<OrderManagementViewRevamp />)

        expect(mockUpdateOrderManagementFlows).not.toHaveBeenCalled()
    })
})
