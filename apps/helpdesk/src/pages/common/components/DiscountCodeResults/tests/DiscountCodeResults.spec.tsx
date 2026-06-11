import React from 'react'

import client from '@repo/api-resources'
import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'

import { discountCodeResult } from 'fixtures/discountCodes'
import { integrationsState } from 'fixtures/integrations'

import { DiscountCodeResults } from '../DiscountCodeResults'

const FETCH_RESULTS_DEBOUNCE_MS = 300

const minProps = {
    integration: fromJS({
        ...integrationsState.integration,
        meta: {
            ...integrationsState.integration.meta,
            oauth: {
                scope: ['read_discounts', 'write_discounts'],
            },
        },
    }),
    onDiscountSelected: jest.fn(),
    onResetStoreChoice: jest.fn(),
}

const renderDiscountCodeResults = () => {
    return render(<DiscountCodeResults {...minProps} />)
}

const flushDiscountCodeFetchDebounce = async () => {
    await act(async () => {
        await jest.advanceTimersByTimeAsync(FETCH_RESULTS_DEBOUNCE_MS)
    })
}

describe('<DiscountCodeResults />', () => {
    let mockServer: MockAdapter

    beforeEach(() => {
        jest.useFakeTimers()
        mockServer = new MockAdapter(client)
    })

    afterEach(() => {
        mockServer.restore()
        jest.useRealTimers()
    })

    it('should render the component', () => {
        const { container } = renderDiscountCodeResults()

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the discount codes', async () => {
        mockServer
            .onGet('/api/discount-codes/5/')
            .reply(200, discountCodeResult())

        const { container } = renderDiscountCodeResults()

        await flushDiscountCodeFetchDebounce()

        expect(mockServer.history.get).toHaveLength(1)
        expect(await screen.findByText(/CODE1/i)).toBeInTheDocument()
        expect(container).toMatchSnapshot()
    })

    it('should render no results', async () => {
        mockServer.onGet('/api/discount-codes/5/').reply(200, { data: [] })

        const { container } = renderDiscountCodeResults()

        await flushDiscountCodeFetchDebounce()

        expect(mockServer.history.get).toHaveLength(1)
        expect(await screen.findByText(/No results found/i)).toBeInTheDocument()
        expect(container).toMatchSnapshot()
    })

    it('shows an error toast when fetching discount codes fails', async () => {
        mockServer.onGet('/api/discount-codes/5/').reply(500)

        renderDiscountCodeResults()

        await flushDiscountCodeFetchDebounce()

        const toastEl = await screen.findByRole('status', {
            name: "Couldn't fetch discount codes",
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })
})
