import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import userEvent from '@testing-library/user-event'
import {QueryClientProvider} from '@tanstack/react-query'
import MockAdapter from 'axios-mock-adapter'
import {integrationsState} from 'fixtures/integrations'

import {assumeMock} from 'utils/testing'
import {useListShopifyCustomerSegments} from 'models/integration/queries'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import client from 'models/api/resources'
import DiscountCodeCreateModal from '../DiscountCodeCreateModal'
import {testIds} from '../utils'

jest.mock('models/integration/queries')

const useListShopifyCustomerSegmentsMock = assumeMock(
    useListShopifyCustomerSegments
)

const VALID_SEGMENT_1 = {
    id: 1069404225875,
    name: 'Customers who have purchased at least once',
    admin_graphql_api_id: 'gid://shopify/Segment/1069404225875',
}
const VALID_SEGMENT_2 = {
    id: 1069404193107,
    name: 'Email subscribers',
    admin_graphql_api_id: 'gid://shopify/Segment/1069404193107',
}

const minProps = {
    integration: fromJS(integrationsState.integration),
    onSubmit: jest.fn(),
    onClose: jest.fn(),
}

const mockedServer = new MockAdapter(client)

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const queryClient = mockQueryClient()
// const useModalManagerMock = assumeMock(useModalManager)

describe('<DiscountCodeCreateModal />', () => {
    const store = mockStore({})

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))
        mockedServer
            .onPost(`/api/discount-codes/${integrationsState.integration.id}/`)
            .reply(200, {})

        useListShopifyCustomerSegmentsMock.mockReturnValue({
            data: [VALID_SEGMENT_1, VALID_SEGMENT_2],
            object: 'list',
            uri: '/integrations/shopify/5007/segments/?',
            meta: {
                prev_cursor: null,
                next_cursor: null,
            },
        } as any)
    })

    afterEach(() => {
        jest.useRealTimers()
        mockedServer.reset()
    })

    it('creates a new discount', async () => {
        const {getByTestId, getByRole} = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DiscountCodeCreateModal {...minProps} />
                </QueryClientProvider>
            </Provider>
        )

        // setup
        const codeInput = getByTestId(testIds.codeInput)
        await userEvent.type(codeInput, 'MYCODE')

        const discountTypeSelect = getByTestId(
            `selected-${testIds.discountTypeSelect}`
        )
        const discountValueInput = getByTestId(testIds.discountValueInput)
        const minRequirementsRadio = getByTestId(testIds.minRequirementsRadio)
        const noMinRequirementsRadio = getByTestId(
            testIds.noMinRequirementsRadio
        )

        const saveBtn = getByTestId(testIds.saveBtn)

        userEvent.click(discountTypeSelect)

        userEvent.click(getByRole('menuitem', {name: 'Percentage'}))

        // set discount min amount
        userEvent.click(noMinRequirementsRadio)
        userEvent.click(minRequirementsRadio)
        const minPurchaseAmountInput = getByTestId(
            testIds.minPurchaseAmountInput
        )
        userEvent.clear(minPurchaseAmountInput)
        await userEvent.type(minPurchaseAmountInput, '199')

        userEvent.clear(discountValueInput)
        await userEvent.type(discountValueInput, '20')

        saveBtn.click()

        await waitFor(() => {
            expect(mockedServer.history.post.length).toBe(1)
        })

        expect(mockedServer.history.post[0].data).toEqual(
            '{"starts_at":"2024-01-01T00:00:00.000Z","discount_type":"percentage","title":null,"code":"MYCODE","discount_value":0.2,"once_per_customer":false,"usage_limit":null,"minimum_purchase_amount":199,"segment_ids":null}'
        )
    })

    it('creates a new discount with multiple segments', async () => {
        const {getByTestId, getByRole, getByText} = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DiscountCodeCreateModal {...minProps} />
                </QueryClientProvider>
            </Provider>
        )

        // setup
        const codeInput = getByTestId(testIds.codeInput)
        await userEvent.type(codeInput, 'MYCODE2')

        const discountTypeSelect = getByTestId(
            `selected-${testIds.discountTypeSelect}`
        )
        const discountValueInput = getByTestId(testIds.discountValueInput)
        const minRequirementsRadio = getByTestId(testIds.minRequirementsRadio)
        const noMinRequirementsRadio = getByTestId(
            testIds.noMinRequirementsRadio
        )

        const saveBtn = getByTestId(testIds.saveBtn)

        userEvent.click(discountTypeSelect)

        userEvent.click(getByRole('menuitem', {name: 'Percentage'}))

        // set discount min amount
        userEvent.click(noMinRequirementsRadio)
        userEvent.click(minRequirementsRadio)
        const minPurchaseAmountInput = getByTestId(
            testIds.minPurchaseAmountInput
        )
        userEvent.clear(minPurchaseAmountInput)
        await userEvent.type(minPurchaseAmountInput, '199')

        userEvent.clear(discountValueInput)
        await userEvent.type(discountValueInput, '20')

        const inputElement = getByText('All customers')
        fireEvent.focus(inputElement)

        const validSegmentSample = getByText(VALID_SEGMENT_1.name)
        const validSegmentSample2 = getByText(VALID_SEGMENT_2.name)

        // Selects the first segment
        userEvent.click(validSegmentSample)
        expect(inputElement.textContent).toBe(VALID_SEGMENT_1.name)

        // Selects the second segment
        userEvent.click(validSegmentSample2)
        expect(inputElement.textContent).toBe('2 segments selected')

        // Delete, check and readd the first segment
        userEvent.click(validSegmentSample)
        expect(inputElement.textContent).toBe(VALID_SEGMENT_2.name)
        userEvent.click(validSegmentSample)

        saveBtn.click()

        await waitFor(() => {
            expect(mockedServer.history.post.length).toBe(1)
        })

        expect(mockedServer.history.post[0].data).toContain(
            `"segment_ids":["${VALID_SEGMENT_2.id}","${VALID_SEGMENT_1.id}"]}`
        )
    })
})
