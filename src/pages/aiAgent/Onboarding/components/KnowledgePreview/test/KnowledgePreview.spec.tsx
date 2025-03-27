import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { appQueryClient } from 'api/queryClient'
import useTopProducts from 'pages/aiAgent/Onboarding/components/TopProductsCard/hooks'
import { assumeMock } from 'utils/testing'

import KnowledgePreview from '../KnowledgePreview'

jest.mock('pages/aiAgent/Onboarding/components/TopProductsCard/hooks')
const useTopProductsMock = assumeMock(useTopProducts)

const mockStore = configureMockStore([thunk])()

describe('KnowledgePreview', () => {
    jest.useFakeTimers()

    beforeAll(() => {
        useTopProductsMock.mockReturnValue({
            isLoading: false,
            data: [],
        })
    })

    it('should render without crashing', () => {
        render(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <KnowledgePreview shopName="shop-name" />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getAllByText('Average order per day').length).toBe(4)
        expect(screen.getAllByText('Top Locations').length).toBe(4)
        expect(screen.getAllByText('Top Products').length).toBe(4)
        expect(screen.getAllByText('Experience score').length).toBe(4)
        expect(screen.getAllByText('Average discount given').length).toBe(4)
        expect(screen.getAllByText('Repeat Rate').length).toBe(4)
    })
})
