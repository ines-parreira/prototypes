import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

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
        render(
            <Provider store={mockStore}>
                <Activation />
            </Provider>,
        )

    beforeEach(() => {
        jest.clearAllMocks()
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

    it('should render a message when journey data is missing', () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: undefined,
            isLoading: false,
            isErrorJourneyData: false,
            shopName: 'test-store',
        })

        renderComponent()

        expect(
            screen.getByText(
                'This flow could not be found. It may not have been created yet.',
            ),
        ).toBeInTheDocument()
    })

    it('should render an error message when journey data failed to load', () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: undefined,
            isLoading: false,
            isErrorJourneyData: true,
            shopName: 'test-store',
        })

        renderComponent()

        expect(
            screen.getByText(
                'This flow could not be loaded. Please refresh the page or go back and try again.',
            ),
        ).toBeInTheDocument()
    })
})
