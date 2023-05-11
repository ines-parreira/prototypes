import {fromJS, Map, List} from 'immutable'

import {
    shopifyLineItemFixture,
    shopifyRefundOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from '../../../fixtures/shopify'
import {
    getRefundAmount,
    getRestockType,
    getSubtotal,
    getTotalAvailableToRefund,
    getTotalCartDiscountAmount,
    getTotalQuantities,
    getTotalTax,
    distributeRefund,
    aggregateMaximumRefundableByGateway,
    getTransactionToRefund,
} from '../refund'

describe('getSubtotal()', () => {
    it('should return subtotal', () => {
        const refund = fromJS(shopifySuggestedRefundFixture())
        const subtotal = getSubtotal(refund)

        expect(subtotal).toMatchSnapshot()
    })
})

describe('getTotalCartDiscountAmount()', () => {
    it('should return total discount', () => {
        const refund = fromJS(shopifySuggestedRefundFixture())
        const total = getTotalCartDiscountAmount(refund)

        expect(total).toMatchSnapshot()
    })
})

describe('getTotalTax()', () => {
    it('should return total tax', () => {
        const refund = fromJS(shopifySuggestedRefundFixture()) as Map<any, any>
        const total = getTotalTax(refund)

        expect(total).toMatchSnapshot()
    })

    it('should return total tax, including tax if shipping line', () => {
        const refund = (
            fromJS(shopifySuggestedRefundFixture()) as Map<any, any>
        ).setIn(['shipping', 'tax'], '00.90')
        const total = getTotalTax(refund)

        expect(total).toMatchSnapshot()
    })
})

describe('getRefundAmount()', () => {
    it('should return refund amount', () => {
        const refund = fromJS(shopifySuggestedRefundFixture())
        const amount = getRefundAmount(refund)

        expect(amount).toMatchSnapshot()
    })

    it('should return refund amount with multiple transactions', () => {
        const fixture = shopifySuggestedRefundFixture()
        const newTransaction = {
            ...fixture.transactions[0],
            amount: '2.20',
            maximum_refundable: '2.20',
        }
        fixture.transactions.push(newTransaction)
        const refund = fromJS(fixture)
        const amount = getRefundAmount(refund)

        expect(amount).toBe(3.4)
    })
})

describe('getTotalAvailableToRefund()', () => {
    it('should return maximum refund amount', () => {
        const refund = fromJS(shopifySuggestedRefundFixture())
        const amount = getTotalAvailableToRefund(refund)

        expect(amount).toMatchSnapshot()
    })
})

describe('getTotalQuantities()', () => {
    it('should return total quantities', () => {
        const payload = fromJS(shopifyRefundOrderPayloadFixture())
        const refund = fromJS(shopifySuggestedRefundFixture())
        const total = getTotalQuantities(payload, refund)

        expect(total).toMatchSnapshot()
    })

    it('should return total quantities because the suggested refund is `null`', () => {
        const payload = fromJS(shopifyRefundOrderPayloadFixture())
        const refund = null
        const total = getTotalQuantities(payload, refund)

        expect(total).toMatchSnapshot()
    })

    it('should return `0` because `location_id` is `null` in the suggested refund', () => {
        const payload = fromJS(shopifyRefundOrderPayloadFixture())
        const refund = fromJS(shopifySuggestedRefundFixture({locationId: null}))
        const total = getTotalQuantities(payload, refund)

        expect(total).toMatchSnapshot()
    })
})

describe('getRestockType()', () => {
    it('should return `"no_restock"` because `restock` is `false`', () => {
        const lineItem = fromJS(shopifyLineItemFixture())
        const restock = false
        const restockType = getRestockType(lineItem, restock)

        expect(restockType).toBe('no_restock')
    })

    it('should return `"return"` because the line item has been fulfilled', () => {
        const lineItem = (
            fromJS(shopifyLineItemFixture()) as Map<any, any>
        ).set('fulfillment_status', 'fulfilled')
        const restock = true
        const restockType = getRestockType(lineItem, restock)

        expect(restockType).toBe('return')
    })

    it('should return `"cancel"` because the line item has not been fulfilled', () => {
        const lineItem = (
            fromJS(shopifyLineItemFixture()) as Map<any, any>
        ).set('fulfillment_status', null)
        const restock = true
        const restockType = getRestockType(lineItem, restock)

        expect(restockType).toBe('cancel')
    })

    it('should return `"no_restock"` because the line item its not eligible to restock', () => {
        const lineItem = (
            fromJS(shopifyLineItemFixture()) as Map<any, any>
        ).set('fulfillment_status', 'not_eligible')
        const restock = true
        const restockType = getRestockType(lineItem, restock)

        expect(restockType).toBe('no_restock')
    })
})

describe('distributeRefund()', () => {
    it('should return an empty list with no transactions', () => {
        const amounts = Map({test: 22.6})
        const distributedTransaction = distributeRefund(List(), amounts)

        expect(distributedTransaction).toBe(List())
    })

    it('should not change transaction with missing gateways', () => {
        const amounts = Map({test: 22.6})
        const transaction = Map({
            gateway: 'other_test',
            maximum_refundable: '1.22',
            amount: '0.00',
        })
        const distributedTransaction = distributeRefund(
            List([transaction]),
            amounts
        )

        expect(distributedTransaction).toStrictEqual(List([transaction]))
    })

    it('should check the maximum refundable', () => {
        const amounts = Map({test: 22.6})
        const transaction = Map({
            gateway: 'test',
            maximum_refundable: '1.22',
            amount: '0.00',
        })
        const distributedTransaction = distributeRefund(
            List([transaction]),
            amounts
        )
        const expectTransaction = transaction.set('amount', '1.22')

        expect(distributedTransaction).toStrictEqual(List([expectTransaction]))
    })

    it('should works on differents gateways', () => {
        const amounts = Map({
            test: 22.6,
            other: 10,
        })
        const transaction1 = Map({
            gateway: 'test',
            maximum_refundable: '10.60',
            amount: '0.00',
        })
        const transaction2 = transaction1.set('gateway', 'other')
        const transaction3 = transaction1.set('maximum_refundable', '2.00')

        const distributedTransaction = distributeRefund(
            List([transaction1, transaction2, transaction3]),
            amounts
        )
        const expectTransaction1 = transaction1.set('amount', '10.60')
        const expectTransaction2 = transaction2.set('amount', '10.00')
        const expectTransaction3 = transaction3.set('amount', '2.00')

        expect(distributedTransaction).toStrictEqual(
            List([expectTransaction1, expectTransaction2, expectTransaction3])
        )
    })
})

describe('aggregateMaximumRefundableByGateway()', () => {
    it('should return an empty map with no transactions', () => {
        const amounts = aggregateMaximumRefundableByGateway(Map())

        expect(amounts).toStrictEqual(Map())
    })

    it('should aggregate maximum transaction per gateway', () => {
        const transaction1 = Map({
            gateway: 'test',
            maximum_refundable: '10.60',
            amount: '0.00',
        })
        const transaction2 = transaction1.set('gateway', 'other')
        const transaction3 = transaction1.set('maximum_refundable', '2.00')
        const refund = Map({
            transactions: List([transaction1, transaction2, transaction3]),
        })
        const amounts = aggregateMaximumRefundableByGateway(refund)

        expect(amounts).toStrictEqual(
            Map({
                test: 12.6,
                other: 10.6,
            })
        )
    })

    it('should remove gift cards from the aggregation', () => {
        const transaction1 = Map({
            gateway: 'test',
            maximum_refundable: '10.60',
            amount: '0.00',
        })
        const transaction2 = transaction1.set('gateway', 'gift_card')
        const refund = Map({
            transactions: List([transaction1, transaction2]),
        })
        const amounts = aggregateMaximumRefundableByGateway(refund)

        expect(amounts).toStrictEqual(
            Map({
                test: 10.6,
            })
        )
    })
})

describe('getTransactionToRefund()', () => {
    it('should return an empty list with no transaction given', () => {
        const transactions = getTransactionToRefund(Map(), 1)

        expect(transactions).toStrictEqual(List())
    })

    it('should return new list with refund', () => {
        const transaction1 = Map({
            gateway: 'test',
            maximum_refundable: '10.60',
            amount: '0.00',
        })
        const txs = List([transaction1])
        const refund = Map({
            transactions: txs,
        })
        const transactions = getTransactionToRefund(refund, 1)

        const expectedTransactions = txs.setIn([0, 'amount'], '1.00')

        expect(transactions).toStrictEqual(expectedTransactions)
    })

    it('should throw an error with multiple gateways', () => {
        const transaction1 = Map({
            gateway: 'test',
            maximum_refundable: '10.60',
            amount: '0.00',
        })
        const transaction2 = transaction1.set('gateway', 'other')

        const txs = List([transaction1, transaction2])
        const refund = Map({
            transactions: txs,
        })

        expect(() => getTransactionToRefund(refund, 1)).toThrow(
            new Error('Refund with multiple transaction is not supported')
        )
    })
})
