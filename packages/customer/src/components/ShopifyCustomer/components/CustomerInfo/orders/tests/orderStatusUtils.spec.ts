import { isFulfilledStatus, isRefundedStatus } from '../orderStatusUtils'

describe('isRefundedStatus', () => {
    it('returns true for refunded', () => {
        expect(isRefundedStatus('refunded')).toBe(true)
    })

    it('returns true for partially_refunded', () => {
        expect(isRefundedStatus('partially_refunded')).toBe(true)
    })

    it('returns true for voided', () => {
        expect(isRefundedStatus('voided')).toBe(true)
    })

    it('returns false for paid', () => {
        expect(isRefundedStatus('paid')).toBe(false)
    })

    it('returns false for pending', () => {
        expect(isRefundedStatus('pending')).toBe(false)
    })

    it('handles GraphQL uppercase REFUNDED', () => {
        expect(isRefundedStatus('REFUNDED')).toBe(true)
    })

    it('handles GraphQL uppercase PARTIALLY_REFUNDED', () => {
        expect(isRefundedStatus('PARTIALLY_REFUNDED')).toBe(true)
    })

    it('handles GraphQL uppercase VOIDED', () => {
        expect(isRefundedStatus('VOIDED')).toBe(true)
    })

    it('returns false for GraphQL uppercase PAID', () => {
        expect(isRefundedStatus('PAID')).toBe(false)
    })

    it('returns false for undefined', () => {
        expect(isRefundedStatus(undefined)).toBe(false)
    })

    it('returns false for null', () => {
        expect(isRefundedStatus(null)).toBe(false)
    })
})

describe('isFulfilledStatus', () => {
    it('returns true for fulfilled', () => {
        expect(isFulfilledStatus('fulfilled')).toBe(true)
    })

    it('returns true for partial', () => {
        expect(isFulfilledStatus('partial')).toBe(true)
    })

    it('returns false for unfulfilled', () => {
        expect(isFulfilledStatus('unfulfilled')).toBe(false)
    })

    it('returns false for partially_fulfilled (legacy parity)', () => {
        expect(isFulfilledStatus('partially_fulfilled')).toBe(false)
    })

    it('returns false for restocked', () => {
        expect(isFulfilledStatus('restocked')).toBe(false)
    })

    it('handles GraphQL uppercase FULFILLED', () => {
        expect(isFulfilledStatus('FULFILLED')).toBe(true)
    })

    it('handles GraphQL uppercase PARTIAL', () => {
        expect(isFulfilledStatus('PARTIAL')).toBe(true)
    })

    it('returns false for undefined', () => {
        expect(isFulfilledStatus(undefined)).toBe(false)
    })

    it('returns false for null', () => {
        expect(isFulfilledStatus(null)).toBe(false)
    })
})
