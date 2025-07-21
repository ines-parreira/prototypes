import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { STEPS_NAMES } from 'AIJourney/constants'
import { IntegrationsProvider } from 'AIJourney/providers'
import { appQueryClient } from 'api/queryClient'
import { renderWithRouter } from 'utils/testing'

import { AiJourneyOnboarding } from './AiJourneyOnboarding'

describe('<AiJourneyOnboarding />', () => {
    const mockStore = configureMockStore([thunk])()

    it('should render AI Journey landing page', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <AiJourneyOnboarding
                            step={STEPS_NAMES.CONVERSATION_SETUP}
                        />
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText('Continue')).toBeInTheDocument()
        expect(screen.getByTestId('ai-journey-button')).toBeInTheDocument()
    })
})
