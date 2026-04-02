import type { OrderRefund } from '../../../../types'
import { getRefundNote } from '../sections/orderRefundUtils'

const makeRefund = (
    overrides: Partial<OrderRefund> &
        Pick<OrderRefund, 'refund_line_items' | 'transactions'>,
): OrderRefund => ({
    id: 1,
    order_id: 1,
    created_at: '2026-01-01T00:00:00Z',
    note: '',
    processed_at: '2026-01-01T00:00:00Z',
    ...overrides,
})

describe('getRefundNote', () => {
    it('returns undefined when no refunds', () => {
        expect(getRefundNote(undefined)).toBeUndefined()
        expect(getRefundNote([])).toBeUndefined()
    })

    it('returns the note from the most recent refund', () => {
        const refunds = [
            makeRefund({
                note: 'Old note',
                created_at: '2026-01-01T00:00:00Z',
                refund_line_items: [],
                transactions: [],
            }),
            makeRefund({
                note: 'Recent note',
                created_at: '2026-02-01T00:00:00Z',
                refund_line_items: [],
                transactions: [],
            }),
        ]

        expect(getRefundNote(refunds)).toBe('Recent note')
    })

    it('skips empty notes and returns first non-empty', () => {
        const refunds = [
            makeRefund({
                note: 'Has note',
                created_at: '2026-01-01T00:00:00Z',
                refund_line_items: [],
                transactions: [],
            }),
            makeRefund({
                note: '',
                created_at: '2026-02-01T00:00:00Z',
                refund_line_items: [],
                transactions: [],
            }),
        ]

        expect(getRefundNote(refunds)).toBe('Has note')
    })
})
