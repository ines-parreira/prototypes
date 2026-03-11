import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { appQueryClient } from 'api/queryClient'
import { renderWithRouter } from 'utils/testing'

import { Activation } from './Activation'

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

jest.mock('AIJourney/hooks', () => ({
    ...jest.requireActual('AIJourney/hooks'),
    useHandleSendTestSMS: jest.fn(() => ({
        handleTestSms: jest.fn(),
        isLoading: false,
    })),
}))

jest.mock('models/integration/queries', () => ({
    useListProducts: jest.fn(() => ({ data: undefined })),
}))

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

describe('<Activation />', () => {
    const mockStore = configureMockStore([thunk])()

    const renderComponent = () =>
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <Activation />
                </QueryClientProvider>
            </Provider>,
        )

    beforeEach(() => {
        jest.clearAllMocks()
        appQueryClient.clear()
    })

    it('should render SendTestCard when journey data is available', () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: { id: 'journey-123' },
            currentIntegration: { id: 1 },
            journeyType: 'cart-abandoned',
            isLoading: false,
        })

        renderComponent()

        expect(screen.getByText('Send a test')).toBeInTheDocument()
    })

    it('should render a loading spinner when data is loading', () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: undefined,
            isLoading: true,
        })

        renderComponent()

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should render page not found when journey data is missing', () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: undefined,
            isLoading: false,
        })

        renderComponent()

        expect(screen.getByText('Page not found.')).toBeInTheDocument()
    })
})
