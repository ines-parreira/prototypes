// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

import { AiAgentVolume } from '../AiAgentVolume'
import { SALES } from '../constants'

const queryClient = mockQueryClient()

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore({})}>
            <QueryClientProvider client={queryClient}>
                <AiAgentVolume />
            </QueryClientProvider>
        </Provider>,
    )

describe('<AiAgentVolume />', () => {
    it('should render the volume settings', () => {
        renderComponent()
        screen.getByRole('heading', { level: 1, name: SALES })
    })
})
