import React from 'react'
import {render, waitFor} from '@testing-library/react'

import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {QueryClientProvider} from '@tanstack/react-query'
import {integrationsState} from 'fixtures/integrations'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'
import {useListDiscountOffers} from 'models/convert/discountOffer/queries'
import {uniqueDiscountOffers} from 'fixtures/uniqueDiscountOffers'
import UniqueDiscountCodeResults from '../UniqueDiscountOfferResults'

jest.mock('models/convert/discountOffer/queries')

const minProps = {
    integration: fromJS({
        ...integrationsState.integration,
        oauth: {
            scope: ['read_discounts', 'write_discounts'],
        },
    }),
    onDiscountClicked: jest.fn(),
    onResetStoreChoice: jest.fn(),
}

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const queryClient = mockQueryClient()

const useListDiscountOffersMock = assumeMock(useListDiscountOffers)

describe('<DiscountCodeResults />', () => {
    const store = mockStore({})

    afterEach(() => {
        useListDiscountOffersMock.mockRestore()
    })

    it('should render the discount codes', async () => {
        useListDiscountOffersMock.mockReturnValue({
            data: uniqueDiscountOffers,
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        } as any)

        const {getByText} = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountCodeResults {...minProps} />
                </QueryClientProvider>
            </Provider>
        )

        await waitFor(() => {
            expect(getByText(/CODE1/i)).toBeDefined()
        })
    })

    it('should render no results', async () => {
        useListDiscountOffersMock.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        } as any)

        const {getByText} = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountCodeResults {...minProps} />
                </QueryClientProvider>
            </Provider>
        )

        await waitFor(() => {
            expect(getByText(/No results found/i)).toBeDefined()
        })
    })
})
