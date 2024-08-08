import React from 'react'
import {QueryClientProvider} from '@tanstack/react-query'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {campaign} from 'fixtures/campaign'

import {useGetCampaign} from 'models/convert/campaign/queries'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock, renderWithRouter} from 'utils/testing'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import ABGroupIndexPage from '../ABGroupIndexPage'

const queryClient = mockQueryClient()

jest.mock('models/convert/campaign/queries')
const useGetCampaignMock = assumeMock(useGetCampaign)

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

const renderComponent = () => {
    return renderWithRouter(
        <Provider store={mockStore()}>
            <QueryClientProvider client={queryClient}>
                <ABGroupIndexPage />
            </QueryClientProvider>
        </Provider>
    )
}

describe('<ABGroupIndexPage />', () => {
    beforeEach(() => {
        useGetCampaignMock.mockReturnValue({data: campaign} as any)
    })

    it('renders', () => {
        const {getByText} = renderComponent()
        expect(getByText('Welcome to the internet')).toBeInTheDocument()
        expect(getByText('Test Settings')).toBeInTheDocument()
        expect(getByText('Control Variant')).toBeInTheDocument()
    })

    it('campaign does not exist', () => {
        useGetCampaignMock.mockReturnValue({data: null} as any)

        const {queryByText} = renderComponent()
        expect(queryByText('Welcome to the internet')).not.toBeInTheDocument()
    })
})
