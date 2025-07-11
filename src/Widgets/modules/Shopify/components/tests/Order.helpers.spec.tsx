import { calculateReturnsStatus } from '../Order.helpers'

type TestOrder = {
    line_items?: {
        id: number
        quantity: number
    }[]
    returns?: {
        return_line_items?: {
            line_item_id: number
            quantity: number
        }[]
    }[]
}

describe('Order.helpers', () => {
    describe('calculateReturnsStatus', () => {
        it('should return null when order is undefined', () => {
            expect(calculateReturnsStatus(undefined)).toBeNull()
        })

        it('should return null when order has no returns', () => {
            const order: TestOrder = {
                line_items: [
                    { id: 1, quantity: 2 },
                    { id: 2, quantity: 1 },
                ],
            }

            expect(calculateReturnsStatus(order as any)).toBeNull()
        })

        it('should return null when order has empty returns array', () => {
            const order: TestOrder = {
                line_items: [
                    { id: 1, quantity: 2 },
                    { id: 2, quantity: 1 },
                ],
                returns: [],
            }

            expect(calculateReturnsStatus(order as any)).toBeNull()
        })

        it('should return null when returns have no return_line_items', () => {
            const order: TestOrder = {
                line_items: [
                    { id: 1, quantity: 2 },
                    { id: 2, quantity: 1 },
                ],
                returns: [
                    { return_line_items: [] },
                    { return_line_items: undefined },
                ],
            }

            expect(calculateReturnsStatus(order as any)).toBeNull()
        })

        it('should return FullReturn when all items are fully returned', () => {
            const order: TestOrder = {
                line_items: [
                    { id: 1, quantity: 2 },
                    { id: 2, quantity: 1 },
                ],
                returns: [
                    {
                        return_line_items: [
                            { line_item_id: 1, quantity: 2 },
                            { line_item_id: 2, quantity: 1 },
                        ],
                    },
                ],
            }

            expect(calculateReturnsStatus(order as any)).toBe('FullReturn')
        })

        it('should return PartialReturn when some items are partially returned', () => {
            const order: TestOrder = {
                line_items: [
                    { id: 1, quantity: 2 },
                    { id: 2, quantity: 1 },
                ],
                returns: [
                    {
                        return_line_items: [{ line_item_id: 1, quantity: 1 }],
                    },
                ],
            }

            expect(calculateReturnsStatus(order as any)).toBe('PartialReturn')
        })

        it('should return PartialReturn when only some items are returned', () => {
            const order: TestOrder = {
                line_items: [
                    { id: 1, quantity: 2 },
                    { id: 2, quantity: 1 },
                ],
                returns: [
                    {
                        return_line_items: [{ line_item_id: 1, quantity: 2 }],
                    },
                ],
            }

            expect(calculateReturnsStatus(order as any)).toBe('PartialReturn')
        })

        it('should sum quantities across multiple returns for the same item', () => {
            const order: TestOrder = {
                line_items: [
                    { id: 1, quantity: 5 },
                    { id: 2, quantity: 2 },
                ],
                returns: [
                    {
                        return_line_items: [
                            { line_item_id: 1, quantity: 2 },
                            { line_item_id: 2, quantity: 1 },
                        ],
                    },
                    {
                        return_line_items: [
                            { line_item_id: 1, quantity: 3 },
                            { line_item_id: 2, quantity: 1 },
                        ],
                    },
                ],
            }

            expect(calculateReturnsStatus(order as any)).toBe('FullReturn')
        })

        it('should handle returns with quantities exceeding original quantities', () => {
            const order: TestOrder = {
                line_items: [{ id: 1, quantity: 2 }],
                returns: [
                    {
                        return_line_items: [{ line_item_id: 1, quantity: 5 }],
                    },
                ],
            }

            expect(calculateReturnsStatus(order as any)).toBe('FullReturn')
        })

        it('should handle order with no line_items', () => {
            const order: TestOrder = {
                line_items: [],
                returns: [
                    {
                        return_line_items: [{ line_item_id: 1, quantity: 1 }],
                    },
                ],
            }

            expect(calculateReturnsStatus(order as any)).toBe('FullReturn')
        })

        it('should handle order with undefined line_items', () => {
            const order: TestOrder = {
                returns: [
                    {
                        return_line_items: [{ line_item_id: 1, quantity: 1 }],
                    },
                ],
            }

            expect(calculateReturnsStatus(order as any)).toBe('FullReturn')
        })

        it('should handle a case where not all quantities are returned', () => {
            const order: TestOrder = {
                line_items: [{ id: 1, quantity: 2 }],
                returns: [
                    {
                        return_line_items: [{ line_item_id: 1, quantity: 1 }],
                    },
                ],
            }

            expect(calculateReturnsStatus(order as any)).toBe('PartialReturn')
        })

        it('should handle mixed scenario with different return patterns', () => {
            const order: TestOrder = {
                line_items: [
                    { id: 1, quantity: 3 },
                    { id: 2, quantity: 2 },
                    { id: 3, quantity: 1 },
                ],
                returns: [
                    {
                        return_line_items: [
                            { line_item_id: 1, quantity: 1 },
                            { line_item_id: 2, quantity: 2 },
                        ],
                    },
                    {
                        return_line_items: [{ line_item_id: 1, quantity: 2 }],
                    },
                ],
            }

            expect(calculateReturnsStatus(order as any)).toBe('PartialReturn')
        })
    })
})
