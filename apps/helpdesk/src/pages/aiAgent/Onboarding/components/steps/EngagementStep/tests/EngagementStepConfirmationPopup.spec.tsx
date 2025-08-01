import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { shopifyIntegration } from 'fixtures/integrations'
import * as hooks from 'hooks/useAppSelector'
import { useGmvUsdOver30Days } from 'pages/aiAgent/components/CustomerEngagementSettings/hooks/useGmvUsdOver30Days'
import { useLowestPotentialImpact } from 'pages/aiAgent/components/CustomerEngagementSettings/hooks/useLowestPotentialImpact'
import { renderWithRouter } from 'utils/testing'

import { EngagementStepConfirmationPopup } from '../EngagementStepConfirmationPopup'

jest.mock(
    'pages/aiAgent/components/CustomerEngagementSettings/hooks/useGmvUsdOver30Days',
)
jest.mock(
    'pages/aiAgent/components/CustomerEngagementSettings/hooks/useLowestPotentialImpact',
)

const mockUseGmvUsdOver30Days = assumeMock(useGmvUsdOver30Days)
const mockUseLowestPotentialImpact = assumeMock(useLowestPotentialImpact)

jest.spyOn(hooks, 'default').mockReturnValue(fromJS(shopifyIntegration))

const queryClient = new QueryClient()

const history = createMemoryHistory({
    initialEntries: [`/shop/${shopifyIntegration.meta.shop_name}`],
})

const defaultProps = {
    isOpen: true,
    onTurnOff: jest.fn(),
    onKeepOn: jest.fn(),
    onClose: jest.fn(),
}

const mockGmvData = [
    [
        {
            dateTime: '2024-01-01T00:00:00Z',
            value: 10000,
        },
    ],
]
const mockLowestPotentialImpact = '$500'

const renderWithProvider = (props = defaultProps) => {
    return renderWithRouter(
        <Provider store={configureMockStore()()}>
            <QueryClientProvider client={queryClient}>
                <EngagementStepConfirmationPopup {...props} />
            </QueryClientProvider>
        </Provider>,
        {
            history,
            path: '/shop/:shopName',
            route: `/shop/${shopifyIntegration.meta.shop_name}`,
        },
    )
}

describe('EngagementStepConfirmationPopup', () => {
    beforeEach(() => {
        mockUseGmvUsdOver30Days.mockReturnValue({
            data: mockGmvData,
            isLoading: false,
        })

        mockUseLowestPotentialImpact.mockReturnValue(mockLowestPotentialImpact)
        jest.clearAllTimers()
    })

    beforeAll(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.clearAllTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('renders correctly when open', () => {
        renderWithProvider()

        jest.runAllTimers()

        expect(
            screen.getByText('Keep Customer Engagement on to boost sales'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Customer engagement features help your Shopping Assistant/,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Keep them on to make the most of every store visit/,
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Turn Off')).toBeInTheDocument()
        expect(
            screen.getByText('Keep Engagement Features On'),
        ).toBeInTheDocument()
    })

    it('does not render when closed', () => {
        renderWithProvider({ ...defaultProps, isOpen: false })
        expect(
            screen.queryByText('Keep Customer Engagement on to boost sales'),
        ).not.toBeInTheDocument()
    })

    it('calls onTurnOff when Turn Off button is clicked', async () => {
        renderWithProvider()

        jest.runAllTimers()

        const turnOffButton = screen.getByText('Turn Off')

        act(() => {
            userEvent.click(turnOffButton)
        })

        await waitFor(() => {
            expect(defaultProps.onTurnOff).toHaveBeenCalledTimes(1)
        })
    })

    it('calls onKeepOn when Keep Engagement Features On button is clicked', async () => {
        renderWithProvider()

        jest.runAllTimers()

        const keepOnButton = screen.getByText('Keep Engagement Features On')

        act(() => {
            userEvent.click(keepOnButton)
        })

        await waitFor(() => {
            expect(defaultProps.onKeepOn).toHaveBeenCalledTimes(1)
        })
    })

    it('does not render when GMV is loading', async () => {
        mockUseGmvUsdOver30Days.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        renderWithProvider()

        jest.runAllTimers()

        // Wait for the loading state to be reflected in the UI
        await waitFor(() => {
            const turnOffButton = screen.getByRole('button', {
                name: 'Turn Off',
            })
            const keepOnButton = screen.getByRole('button', {
                name: 'Keep Engagement Features On',
            })
            expect(turnOffButton).toHaveAttribute('aria-disabled', 'true')
            expect(keepOnButton).toHaveAttribute('aria-disabled', 'true')
        })

        expect(
            screen.getByText('Keep Customer Engagement on to boost sales'),
        ).toBeInTheDocument()
    })

    it('displays the correct potential impact value', () => {
        renderWithProvider()

        jest.runAllTimers()

        expect(
            screen.getByText((content) =>
                content.includes(mockLowestPotentialImpact),
            ),
        ).toBeInTheDocument()
    })

    it('is not closable by default', () => {
        renderWithProvider()

        jest.runAllTimers()

        const modal = screen.getByRole('dialog')
        expect(modal).toHaveAttribute('aria-modal', 'true')
    })
})
