import { render, screen } from '@testing-library/react'

import { useConnectedChannelsPreviewPanel } from 'pages/automate/connectedChannels/revamp/hooks/useConnectedChannelsPreviewPanel'

import { useOrderManagementFlows } from '../components/OrderManagementFlowsCard/useOrderManagementFlows'
import { OrderManagementViewRevamp } from '../OrderManagementView'

jest.mock(
    'pages/automate/connectedChannels/revamp/hooks/useConnectedChannelsPreviewPanel',
    () => ({
        useConnectedChannelsPreviewPanel: jest.fn(),
    }),
)

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

const mockedUseOrderManagementFlows =
    useOrderManagementFlows as jest.MockedFunction<
        typeof useOrderManagementFlows
    >

describe('OrderManagementViewRevamp', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseOrderManagementFlows.mockReturnValue({
            isLoading: false,
            isUpdatePending: false,
            flows: [],
            handleFlowToggle: jest.fn(),
            navigateToFlow: jest.fn(),
        })
    })

    it('should render the OrderManagementFlowsCard', () => {
        render(<OrderManagementViewRevamp />)

        expect(screen.getByText('OrderManagementFlowsCard')).toBeInTheDocument()
    })

    it('should call useConnectedChannelsPreviewPanel on mount', () => {
        render(<OrderManagementViewRevamp />)

        expect(useConnectedChannelsPreviewPanel).toHaveBeenCalled()
    })

    it('should call useOrderManagementFlows on mount', () => {
        render(<OrderManagementViewRevamp />)

        expect(useOrderManagementFlows).toHaveBeenCalled()
    })
})
