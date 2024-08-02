import React from 'react'
import {QueryClientProvider} from '@tanstack/react-query'

import {campaign} from 'fixtures/campaign'

import {useGetCampaign} from 'models/convert/campaign/queries'

import {assumeMock, renderWithRouter} from 'utils/testing'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import ABGroupIndexPage from '../ABGroupIndexPage'

const queryClient = mockQueryClient()

jest.mock('models/convert/campaign/queries')
const useGetCampaignMock = assumeMock(useGetCampaign)

const renderComponent = () => {
    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <ABGroupIndexPage />
        </QueryClientProvider>
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
