import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { appQueryClient } from 'api/queryClient'
import { account } from 'fixtures/account'
import { renderWithRouter } from 'utils/testing'

import { Playground } from './Playground'

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
    JourneyProvider: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('pages/common/hooks/useCollapsibleColumn', () => ({
    useCollapsibleColumn: jest.fn(),
}))

jest.mock('pages/aiAgent/PlaygroundV2/AiAgentPlayground', () => ({
    AiAgentPlayground: jest.fn(() => (
        <div data-testid="ai-agent-playground">AiAgentPlayground</div>
    )),
}))

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock
const mockUseCollapsibleColumn =
    require('pages/common/hooks/useCollapsibleColumn')
        .useCollapsibleColumn as jest.Mock
const {
    AiAgentPlayground,
} = require('pages/aiAgent/PlaygroundV2/AiAgentPlayground')

describe('<Playground />', () => {
    const mockStore = configureMockStore([thunk])({
        currentAccount: fromJS(account),
    })
    const mockSetIsCollapsibleColumnOpen = jest.fn()

    const renderWithProviders = () => {
        return renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <Playground />
                </QueryClientProvider>
            </Provider>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                id: 'journey-123',
                type: 'cart_abandoned',
                account_id: 6069,
                store_integration_id: 286584,
                store_name: 'gorgias-product-demo',
                store_type: 'shopify',
                state: 'active',
                message_instructions: null,
                created_datetime: '2025-07-04T11:36:13.269056',
                meta: {
                    ticket_view_id: 2099726,
                },
            },
            currentIntegration: undefined,
            shopName: 'shopify-store',
            isLoading: false,
            journeyType: 'cart_abandoned',
            storeConfiguration: {
                monitoredSmsIntegrations: [1, 2],
            },
        })

        mockUseCollapsibleColumn.mockReturnValue({
            collapsibleColumnChildren: null,
            setCollapsibleColumnChildren: jest.fn(),
            isCollapsibleColumnOpen: false,
            setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
            collapsibleColumnRef: { current: null },
            warpToCollapsibleColumn: jest.fn(),
        })
    })

    it('should render AiAgentPlayground', () => {
        renderWithProviders()

        expect(screen.getByTestId('ai-agent-playground')).toBeInTheDocument()
        expect(screen.getByText('AiAgentPlayground')).toBeInTheDocument()
    })

    it('should set collapsible column to open on mount', () => {
        renderWithProviders()

        expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(true)
        expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledTimes(1)
    })

    it('should render loading state', () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: undefined,
            currentIntegration: undefined,
            shopName: 'shopify-store',
            isLoading: true,
            journeyType: 'cart_abandoned',
            storeConfiguration: {
                monitoredSmsIntegrations: [1, 2],
            },
        })

        renderWithProviders()

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should pass correct props to AiAgentPlayground', () => {
        renderWithProviders()

        expect(AiAgentPlayground).toHaveBeenCalledWith(
            expect.objectContaining({
                supportedModes: ['outbound', 'inbound'],
                shopName: 'gorgias-product-demo',
                withSettingsOnSidePanel: true,
                resetPlayground: false,
                resetPlaygroundCallback: expect.any(Function),
            }),
            expect.anything(),
        )
    })

    it('should render Reset button', () => {
        renderWithProviders()

        expect(
            screen.getByRole('button', { name: /reset/i }),
        ).toBeInTheDocument()
    })

    it('should set resetPlayground to true when Reset button is clicked', async () => {
        const user = userEvent.setup()
        renderWithProviders()

        const resetButton = screen.getByRole('button', { name: /reset/i })

        await act(() => user.click(resetButton))

        expect(AiAgentPlayground).toHaveBeenCalledWith(
            expect.objectContaining({
                resetPlayground: true,
            }),
            expect.anything(),
        )
    })

    it('should reset shouldPlaygroundReset when resetPlaygroundCallback is called', async () => {
        const user = userEvent.setup()
        renderWithProviders()

        const resetButton = screen.getByRole('button', { name: /reset/i })

        await act(() => user.click(resetButton))

        const lastCallBeforeCallback = AiAgentPlayground.mock.calls.at(-1)[0]
        expect(lastCallBeforeCallback.resetPlayground).toBe(true)

        act(() => {
            lastCallBeforeCallback.resetPlaygroundCallback()
        })

        const lastCallAfterCallback = AiAgentPlayground.mock.calls.at(-1)[0]
        expect(lastCallAfterCallback.resetPlayground).toBe(false)
    })

    it('should render Configure button when collapsible column is closed', () => {
        mockUseCollapsibleColumn.mockReturnValue({
            collapsibleColumnChildren: null,
            setCollapsibleColumnChildren: jest.fn(),
            isCollapsibleColumnOpen: false,
            setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
            collapsibleColumnRef: { current: null },
            warpToCollapsibleColumn: jest.fn(),
        })

        renderWithProviders()

        expect(
            screen.getByRole('button', { name: /open settings/i }),
        ).toBeInTheDocument()
    })

    it('should not render Configure button when collapsible column is open', () => {
        mockUseCollapsibleColumn.mockReturnValue({
            collapsibleColumnChildren: null,
            setCollapsibleColumnChildren: jest.fn(),
            isCollapsibleColumnOpen: true,
            setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
            collapsibleColumnRef: { current: null },
            warpToCollapsibleColumn: jest.fn(),
        })

        renderWithProviders()

        expect(
            screen.queryByRole('button', { name: /open settings/i }),
        ).not.toBeInTheDocument()
    })

    it('should toggle collapsible column when Configure button is clicked', async () => {
        const user = userEvent.setup()
        mockUseCollapsibleColumn.mockReturnValue({
            collapsibleColumnChildren: null,
            setCollapsibleColumnChildren: jest.fn(),
            isCollapsibleColumnOpen: false,
            setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
            collapsibleColumnRef: { current: null },
            warpToCollapsibleColumn: jest.fn(),
        })

        renderWithProviders()

        const configureButton = screen.getByRole('button', {
            name: /open settings/i,
        })

        await act(() => user.click(configureButton))

        expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(true)
    })

    it('should close collapsible column on unmount', () => {
        const { unmount } = renderWithProviders()

        expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(true)

        unmount()

        expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
        expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledTimes(2)
    })
})
