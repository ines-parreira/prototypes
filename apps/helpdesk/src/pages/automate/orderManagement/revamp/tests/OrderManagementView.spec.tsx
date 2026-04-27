import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

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
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
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

describe('OrderManagementViewRevamp', () => {
    const mockDisplayPage = jest.fn()

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
})
