import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {TicketMessageSourceType} from 'business/types/ticket'
import useSearchRankScenario from 'hooks/useSearchRankScenario'
import {SearchEngine} from 'models/search/types'
import {RootState} from 'state/types'

import MultiSelectAsyncField from '../ReceiversSelectField'

const mockStore = configureMockStore([thunk])

jest.mock('hooks/useSearchRankScenario')
const mockSearchRank = {
    registerResultsRequest: jest.fn(),
    registerResultsResponse: jest.fn(),
    registerResultSelection: jest.fn(),
    endScenario: jest.fn(),
    isRunning: false,
}
;(
    useSearchRankScenario as jest.MockedFunction<typeof useSearchRankScenario>
).mockImplementation(() => mockSearchRank)

jest.mock('state/newMessage/actions', () => ({
    updatePotentialCustomers: jest.fn(
        () => () =>
            Promise.resolve({
                data: [
                    {
                        id: 1,
                        name: 'Gorgias Diana',
                        address: 'diana@gorgias.com',
                    },
                    {
                        id: 2,
                        name: 'Gorgias Artemis',
                        address: 'artemis@gorgias.com',
                    },
                ],
                searchEngine: 'ES',
            })
    ),
}))

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)

describe('<ReceiversSelectField />', () => {
    const defaultStore = {} as unknown as RootState

    const minProps = {
        onChange: jest.fn(),
        sourceType: TicketMessageSourceType.Email,
        value: [],
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should display an empty field', () => {
        const {container} = render(
            <Provider store={mockStore(defaultStore)}>
                <MultiSelectAsyncField {...minProps} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the selected value', () => {
        const value = [
            {
                address: 'hello@acme.io',
                name: 'Acme',
            },
        ]
        const {container} = render(
            <Provider store={mockStore(defaultStore)}>
                <MultiSelectAsyncField {...minProps} value={value} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should register search rank scenario when user search for a term', async () => {
        const query = 'gorgias'
        const {getByPlaceholderText} = render(
            <Provider store={mockStore(defaultStore)}>
                <MultiSelectAsyncField {...minProps} />
            </Provider>
        )

        const inputElement = getByPlaceholderText('Search customers...')
        fireEvent.change(inputElement, {target: {value: query}})
        jest.runOnlyPendingTimers()

        await waitFor(() => {
            expect(mockSearchRank.endScenario).toHaveBeenCalled()
            expect(mockSearchRank.registerResultsRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    query,
                })
            )
        })

        expect(mockSearchRank.registerResultsResponse).toHaveBeenCalledWith(
            expect.objectContaining({
                numberOfResults: 2,
                searchEngine: SearchEngine.ES,
            })
        )
    })

    it('should register search rank scenario when user selects a search result', async () => {
        const query = 'gorgias'
        const {findByText, getByPlaceholderText} = render(
            <Provider store={mockStore(defaultStore)}>
                <MultiSelectAsyncField {...minProps} />
            </Provider>
        )

        const inputElement = getByPlaceholderText('Search customers...')
        fireEvent.change(inputElement, {target: {value: query}})

        jest.runOnlyPendingTimers()

        const result = await findByText(/gorgias artemis/i)
        fireEvent.click(result)
        expect(mockSearchRank.registerResultSelection).toHaveBeenCalledWith({
            id: 2,
            index: 1,
        })
    })
})
