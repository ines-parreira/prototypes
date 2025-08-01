import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { campaign } from 'fixtures/campaign'
import {
    useGetCampaign,
    useUpdateCampaign,
} from 'models/convert/campaign/queries'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import ABGroupPage from '../ABGroupPage'

const queryClient = mockQueryClient()

jest.mock('models/convert/campaign/queries')
const useGetCampaignMock = assumeMock(useGetCampaign)
const useUpdateCampaignMock = assumeMock(useUpdateCampaign)

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

const renderComponent = () => {
    return renderWithRouter(
        <Provider store={mockStore()}>
            <QueryClientProvider client={queryClient}>
                <ABGroupPage />
            </QueryClientProvider>
        </Provider>,
    )
}

describe('<ABGroupIndexPage />', () => {
    beforeEach(() => {
        useGetCampaignMock.mockReturnValue({ data: campaign } as any)
        useUpdateCampaignMock.mockImplementation(() => {
            return {
                mutateAsync: jest.fn(),
            } as unknown as ReturnType<typeof useUpdateCampaign>
        })
    })

    it('renders', () => {
        const { getByText } = renderComponent()
        expect(getByText('Welcome to the internet')).toBeInTheDocument()
        expect(getByText('Test Settings')).toBeInTheDocument()
        expect(getByText('Control Variant')).toBeInTheDocument()
    })

    it('campaign does not exist', () => {
        useGetCampaignMock.mockReturnValue({ data: null } as any)

        const { queryByText } = renderComponent()
        expect(queryByText('Welcome to the internet')).not.toBeInTheDocument()
    })
})
