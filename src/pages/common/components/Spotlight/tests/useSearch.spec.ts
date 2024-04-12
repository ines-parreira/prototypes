import {act} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'
import LD from 'launchdarkly-react-client-sdk'
import {ticket} from 'fixtures/ticket'
import {FeatureFlagKey} from 'config/featureFlags'
import {customer} from 'fixtures/customer'
import {searchCustomers} from 'models/customer/resources'
import {searchTickets} from 'models/ticket/resources'
import {ViewType} from 'models/view/types'
import {useSearch} from 'pages/common/components/Spotlight/useSearch'
import {assumeMock} from 'utils/testing'

jest.mock('models/customer/resources')
const searchCustomersMock = assumeMock(searchCustomers)
jest.mock('models/ticket/resources')
const searchTicketsMock = assumeMock(searchTickets)
jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('hooks/useSearchRankScenario', () => ({
    ...jest.requireActual<Record<string, unknown>>(
        'hooks/useSearchRankScenario'
    ),
    useSearchRankScenario: jest.fn(),
    default: jest.fn().mockReturnValue({
        endScenario: jest.fn(),
        registerResultsRequest: jest.fn(),
        registerResultsResponse: jest.fn(),
    }),
}))

describe('useSearch', () => {
    const customerWithHighlights = {
        entity: customer,
        highlights: {},
    }
    const ticketWithHighlights = {
        entity: ticket,
        highlights: {},
    }

    beforeEach(() => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.SearchWithHighlights]: true,
        }))
    })

    it('should return fetched customers with highlights callback', async () => {
        searchCustomersMock.mockResolvedValue({
            data: {
                data: [customerWithHighlights],
                meta: {next_cursor: '', prev_cursor: null},
                object: '',
                uri: '',
            },
        } as any)
        const {result} = renderHook(() => useSearch())
        await act(async () => {
            await result.current.fetchSearchItems('john', ViewType.CustomerList)
        })

        expect(result.current.resultsWithHighlights).toEqual([
            {...customerWithHighlights, type: 'Customer'},
        ])
    })

    it('should return fetched tickets with highlights callback', async () => {
        searchTicketsMock.mockResolvedValue({
            data: {
                data: [ticketWithHighlights],
                meta: {next_cursor: '', prev_cursor: null},
                object: '',
                uri: '',
            },
        } as any)
        const {result} = renderHook(() => useSearch())
        await act(async () => {
            await result.current.fetchSearchItems('john', ViewType.TicketList)
        })

        expect(result.current.resultsWithHighlights).toEqual([
            {...ticketWithHighlights, type: 'Ticket'},
        ])
    })
})
