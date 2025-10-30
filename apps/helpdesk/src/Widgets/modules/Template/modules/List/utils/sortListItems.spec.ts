import { sortListItems } from './sortListItems'

type Subscription = {
    id: number
    product_title: string
    price: number
    status: string
    created_at: string
    cancelled_at: string | null
    quantity: number
}

const weightManagementSubscription: Subscription = {
    id: 671186621,
    product_title: 'Weight Management Support',
    price: 36,
    status: 'ACTIVE',
    created_at: '2025-07-21T06:13:59',
    cancelled_at: null,
    quantity: 1,
}

const commonSupportSubscription: Subscription = {
    id: 657090791,
    product_title: 'Food-Grown® Common Support',
    price: 29.6,
    status: 'ACTIVE',
    created_at: '2025-06-19T03:37:19',
    cancelled_at: null,
    quantity: 1,
}

const immuneSupportSubscription: Subscription = {
    id: 639532188,
    product_title: 'Food-Grown® Immune Support',
    price: 28.8,
    status: 'ACTIVE',
    created_at: '2025-05-13T07:43:40',
    cancelled_at: null,
    quantity: 1,
}

const beautySleepSubscription: Subscription = {
    id: 695280530,
    product_title: 'Beauty Sleep',
    price: 45.6,
    status: 'CANCELLED',
    created_at: '2025-09-12T04:10:03',
    cancelled_at: '2025-09-12T04:10:27',
    quantity: 10,
}

const nightTimeDuoSubscription: Subscription = {
    id: 639528133,
    product_title: 'Night Time Duo',
    price: 37.2,
    status: 'CANCELLED',
    created_at: '2025-05-13T07:25:39',
    cancelled_at: '2025-09-12T04:10:35',
    quantity: 1,
}

describe('sortListItems', () => {
    it('should return a copy of the array when no orderBy is provided', () => {
        const items = [
            { id: 3, product_title: 'Product C' },
            { id: 1, product_title: 'Product A' },
            { id: 2, product_title: 'Product B' },
        ]

        const result = sortListItems(items)

        expect(result).toEqual(items)
        expect(result).not.toBe(items)
    })

    it('should sort items by product title in ascending order', () => {
        const items: Subscription[] = [
            weightManagementSubscription,
            commonSupportSubscription,
            immuneSupportSubscription,
        ]

        const result = sortListItems(items, {
            key: 'product_title',
            direction: 'ASC',
        })

        expect(result.map((item) => item.product_title)).toEqual([
            'Food-Grown® Common Support',
            'Food-Grown® Immune Support',
            'Weight Management Support',
        ])
    })

    it('should sort items by product title in descending order', () => {
        const items: Subscription[] = [
            weightManagementSubscription,
            commonSupportSubscription,
            immuneSupportSubscription,
        ]

        const result = sortListItems(items, {
            key: 'product_title',
            direction: 'DESC',
        })

        expect(result.map((item) => item.product_title)).toEqual([
            'Weight Management Support',
            'Food-Grown® Immune Support',
            'Food-Grown® Common Support',
        ])
    })

    it('should sort numeric values by price in ascending order', () => {
        const items: Subscription[] = [
            weightManagementSubscription,
            immuneSupportSubscription,
            commonSupportSubscription,
        ]

        const result = sortListItems(items, { key: 'price', direction: 'ASC' })

        expect(result.map((item) => item.price)).toEqual([28.8, 29.6, 36])
    })

    it('should sort numeric values by price in descending order', () => {
        const items: Subscription[] = [
            weightManagementSubscription,
            immuneSupportSubscription,
            commonSupportSubscription,
        ]

        const result = sortListItems(items, {
            key: 'price',
            direction: 'DESC',
        })

        expect(result.map((item) => item.price)).toEqual([36, 29.6, 28.8])
    })

    it('should sort by date strings in ascending order', () => {
        const items: Subscription[] = [
            weightManagementSubscription,
            immuneSupportSubscription,
            commonSupportSubscription,
        ]

        const result = sortListItems(items, {
            key: 'created_at',
            direction: 'ASC',
        })

        expect(result.map((item) => item.created_at)).toEqual([
            '2025-05-13T07:43:40',
            '2025-06-19T03:37:19',
            '2025-07-21T06:13:59',
        ])
    })

    it('should sort by date strings in descending order', () => {
        const items: Subscription[] = [
            immuneSupportSubscription,
            weightManagementSubscription,
            commonSupportSubscription,
        ]

        const result = sortListItems(items, {
            key: 'created_at',
            direction: 'DESC',
        })

        expect(result.map((item) => item.created_at)).toEqual([
            '2025-07-21T06:13:59',
            '2025-06-19T03:37:19',
            '2025-05-13T07:43:40',
        ])
    })

    it('should sort by status alphabetically', () => {
        const items: Subscription[] = [
            weightManagementSubscription,
            beautySleepSubscription,
            nightTimeDuoSubscription,
        ]

        const result = sortListItems(items, {
            key: 'status',
            direction: 'ASC',
        })

        expect(result.map((item) => item.status)).toEqual([
            'ACTIVE',
            'CANCELLED',
            'CANCELLED',
        ])
    })

    it('should handle items that are not records', () => {
        const items = [3, 1, 2]

        const result = sortListItems(items, { key: 'value', direction: 'ASC' })

        expect(result).toEqual([3, 1, 2])
    })

    it('should handle mixed types (records and non-records)', () => {
        const items = [
            { product_title: 'Product A' },
            'string',
            { product_title: 'Product B' },
            null,
        ]

        const result = sortListItems(items, {
            key: 'product_title',
            direction: 'ASC',
        })

        expect(result).toHaveLength(4)
    })

    it('should handle empty arrays', () => {
        const items: Subscription[] = []

        const result = sortListItems(items, {
            key: 'product_title',
            direction: 'ASC',
        })

        expect(result).toEqual([])
    })

    it('should handle single item arrays', () => {
        const items: Subscription[] = [weightManagementSubscription]

        const result = sortListItems(items, {
            key: 'product_title',
            direction: 'ASC',
        })

        expect(result).toEqual([weightManagementSubscription])
    })

    it('should place items with missing sort key at the end when sorting in ascending order', () => {
        const items: Partial<Subscription>[] = [
            {
                id: 671186621,
                product_title: 'Weight Management Support',
                price: 36,
                status: 'ACTIVE',
            },
            {
                id: 657090791,
                product_title: 'Food-Grown® Common Support',
                status: 'ACTIVE',
            },
            {
                id: 639532188,
                product_title: 'Food-Grown® Immune Support',
                price: 28.8,
                status: 'ACTIVE',
            },
        ]

        const result = sortListItems(items, { key: 'price', direction: 'ASC' })

        expect(result[0].product_title).toBe('Food-Grown® Immune Support')
        expect(result[1].product_title).toBe('Weight Management Support')
        expect(result[2].product_title).toBe('Food-Grown® Common Support')
    })

    it('should place items with missing sort key at the end when sorting in descending order', () => {
        const items: Partial<Subscription>[] = [
            {
                id: 671186621,
                product_title: 'Weight Management Support',
                price: 36,
                status: 'ACTIVE',
            },
            {
                id: 657090791,
                product_title: 'Food-Grown® Common Support',
                status: 'ACTIVE',
            },
            {
                id: 639532188,
                product_title: 'Food-Grown® Immune Support',
                price: 28.8,
                status: 'ACTIVE',
            },
        ]

        const result = sortListItems(items, {
            key: 'price',
            direction: 'DESC',
        })

        expect(result[0].product_title).toBe('Weight Management Support')
        expect(result[1].product_title).toBe('Food-Grown® Immune Support')
        expect(result[2].product_title).toBe('Food-Grown® Common Support')
    })

    it('should place null values at the end when sorting in ascending order', () => {
        const items: Subscription[] = [
            beautySleepSubscription,
            weightManagementSubscription,
            nightTimeDuoSubscription,
        ]

        const result = sortListItems(items, {
            key: 'cancelled_at',
            direction: 'ASC',
        })

        expect(result.map((item) => item.cancelled_at)).toEqual([
            '2025-09-12T04:10:27',
            '2025-09-12T04:10:35',
            null,
        ])
    })

    it('should place null values at the end when sorting in descending order', () => {
        const items: Subscription[] = [
            beautySleepSubscription,
            weightManagementSubscription,
            nightTimeDuoSubscription,
        ]

        const result = sortListItems(items, {
            key: 'cancelled_at',
            direction: 'DESC',
        })

        expect(result.map((item) => item.cancelled_at)).toEqual([
            '2025-09-12T04:10:35',
            '2025-09-12T04:10:27',
            null,
        ])
    })

    it('should handle multiple items with null values correctly', () => {
        const items: Subscription[] = [
            beautySleepSubscription,
            weightManagementSubscription,
            commonSupportSubscription,
            immuneSupportSubscription,
        ]

        const result = sortListItems(items, {
            key: 'cancelled_at',
            direction: 'ASC',
        })

        expect(result[0].product_title).toBe('Beauty Sleep')
        expect(result[1].cancelled_at).toBe(null)
        expect(result[2].cancelled_at).toBe(null)
        expect(result[3].cancelled_at).toBe(null)
    })

    it('should handle sorting by quantity with various values', () => {
        const items: Subscription[] = [
            beautySleepSubscription,
            weightManagementSubscription,
            commonSupportSubscription,
        ]

        const result = sortListItems(items, {
            key: 'quantity',
            direction: 'DESC',
        })

        expect(result.map((item) => item.quantity)).toEqual([10, 1, 1])
    })
})
