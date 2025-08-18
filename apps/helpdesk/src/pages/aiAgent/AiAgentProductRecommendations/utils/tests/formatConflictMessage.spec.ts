import type { ProductRecommendationConflictError } from '../../types/productRecommendationErrors'
import { formatConflictMessage } from '../formatConflictMessage'

describe('formatConflictMessage', () => {
    describe('single product conflicts', () => {
        it('should format a single product conflict with promoted action', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [
                    {
                        productId: '123',
                        productName: 'Test Product',
                        conflicts: [
                            {
                                type: 'product',
                                action: 'promoted',
                                items: [{ target: '123' }],
                            },
                        ],
                    },
                ],
            }

            const result = formatConflictMessage(conflictData, 'product')

            expect(result).toBe(
                'Conflict found: Test Product is already promoted',
            )
        })

        it('should format a single product conflict with excluded action', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [
                    {
                        productId: '123',
                        productName: 'Test Product',
                        conflicts: [
                            {
                                type: 'product',
                                action: 'excluded',
                                items: [{ target: '123' }],
                            },
                        ],
                    },
                ],
            }

            const result = formatConflictMessage(conflictData, 'product')

            expect(result).toBe(
                'Conflict found: Test Product is already excluded',
            )
        })

        it('should handle empty product name', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [
                    {
                        productId: '123',
                        productName: '',
                        conflicts: [
                            {
                                type: 'product',
                                action: 'promoted',
                                items: [{ target: '123' }],
                            },
                        ],
                    },
                ],
            }

            const result = formatConflictMessage(conflictData, 'product')

            expect(result).toBe('Conflict found: Product is already promoted')
        })

        it('should handle multiple product conflicts', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [
                    {
                        productId: '123',
                        productName: 'Product A',
                        conflicts: [
                            {
                                type: 'product',
                                action: 'promoted',
                                items: [{ target: '123' }],
                            },
                        ],
                    },
                    {
                        productId: '124',
                        productName: 'Product B',
                        conflicts: [
                            {
                                type: 'product',
                                action: 'excluded',
                                items: [{ target: '124' }],
                            },
                        ],
                    },
                    {
                        productId: '125',
                        productName: 'Product C',
                        conflicts: [
                            {
                                type: 'product',
                                action: 'promoted',
                                items: [{ target: '125' }],
                            },
                        ],
                    },
                ],
            }

            const result = formatConflictMessage(conflictData, 'product')

            expect(result).toBe(
                'Conflict found: Product A is already promoted, Product B is already excluded, Product C is already promoted',
            )
        })

        it('should show hints for tag rule conflicts when using product rules', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [
                    {
                        productId: '123',
                        productName: 'Product A',
                        conflicts: [
                            {
                                type: 'tag',
                                action: 'promoted',
                                items: [{ target: 'sale' }],
                            },
                        ],
                    },
                    {
                        productId: '124',
                        productName: 'Product B',
                        conflicts: [
                            {
                                type: 'tag',
                                action: 'excluded',
                                items: [{ target: 'clearance' }],
                            },
                        ],
                    },
                ],
            }

            const result = formatConflictMessage(conflictData, 'product')

            expect(result).toBe(
                'Conflict found: Product A is already promoted (via tag "sale"), Product B is already excluded (via tag "clearance")',
            )
        })

        it('should show hints for vendor rule conflicts when using product rules', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [
                    {
                        productId: '123',
                        productName: 'Product A',
                        conflicts: [
                            {
                                type: 'vendor',
                                action: 'promoted',
                                items: [{ target: 'Acme Corp' }],
                            },
                        ],
                    },
                    {
                        productId: '124',
                        productName: 'Product B',
                        conflicts: [
                            {
                                type: 'vendor',
                                action: 'excluded',
                                items: [{ target: 'BadVendor' }],
                            },
                        ],
                    },
                ],
            }

            const result = formatConflictMessage(conflictData, 'product')

            expect(result).toBe(
                'Conflict found: Product A is already promoted (via vendor "Acme Corp"), Product B is already excluded (via vendor "BadVendor")',
            )
        })

        it('should handle mixed conflict types with hints', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [
                    {
                        productId: '123',
                        productName: 'Product A',
                        conflicts: [
                            {
                                type: 'product',
                                action: 'promoted',
                                items: [{ target: '123' }],
                            },
                        ],
                    },
                    {
                        productId: '124',
                        productName: 'Product B',
                        conflicts: [
                            {
                                type: 'tag',
                                action: 'excluded',
                                items: [{ target: 'clearance' }],
                            },
                        ],
                    },
                    {
                        productId: '125',
                        productName: 'Product C',
                        conflicts: [
                            {
                                type: 'vendor',
                                action: 'promoted',
                                items: [{ target: 'SuperVendor' }],
                            },
                        ],
                    },
                ],
            }

            const result = formatConflictMessage(conflictData, 'product')

            expect(result).toBe(
                'Conflict found: Product A is already promoted, Product B is already excluded (via tag "clearance"), Product C is already promoted (via vendor "SuperVendor")',
            )
        })

        it('should limit displayed products and show count', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [
                    {
                        productId: '1',
                        productName: 'Product 1',
                        conflicts: [
                            {
                                type: 'product',
                                action: 'promoted',
                                items: [{ target: '1' }],
                            },
                        ],
                    },
                    {
                        productId: '2',
                        productName: 'Product 2',
                        conflicts: [
                            {
                                type: 'product',
                                action: 'promoted',
                                items: [{ target: '2' }],
                            },
                        ],
                    },
                    {
                        productId: '3',
                        productName: 'Product 3',
                        conflicts: [
                            {
                                type: 'product',
                                action: 'promoted',
                                items: [{ target: '3' }],
                            },
                        ],
                    },
                    {
                        productId: '4',
                        productName: 'Product 4',
                        conflicts: [
                            {
                                type: 'product',
                                action: 'promoted',
                                items: [{ target: '4' }],
                            },
                        ],
                    },
                    {
                        productId: '5',
                        productName: 'Product 5',
                        conflicts: [
                            {
                                type: 'product',
                                action: 'promoted',
                                items: [{ target: '5' }],
                            },
                        ],
                    },
                ],
            }

            const result = formatConflictMessage(conflictData, 'product')

            expect(result).toBe(
                'Conflict found: Product 1 is already promoted, Product 2 is already promoted, Product 3 is already promoted (+2 more)',
            )
        })
    })

    describe('tag rule conflicts', () => {
        it('should format conflicts when applying a tag rule to products', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [
                    {
                        productId: '123',
                        productName: 'Product A',
                        conflicts: [
                            {
                                type: 'tag',
                                action: 'promoted',
                                items: [{ target: 'sale' }],
                            },
                        ],
                    },
                    {
                        productId: '124',
                        productName: 'Product B',
                        conflicts: [
                            {
                                type: 'tag',
                                action: 'promoted',
                                items: [{ target: 'sale' }],
                            },
                        ],
                    },
                ],
            }

            const result = formatConflictMessage(conflictData, 'tag')

            expect(result).toBe(
                'Some products with this tag are already promoted: Product A is already promoted (via tag "sale"), Product B is already promoted (via tag "sale")',
            )
        })

        it('should handle tag conflicts with excluded action', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [
                    {
                        productId: '123',
                        productName: 'Product A',
                        conflicts: [
                            {
                                type: 'tag',
                                action: 'excluded',
                                items: [{ target: 'clearance' }],
                            },
                        ],
                    },
                ],
            }

            const result = formatConflictMessage(conflictData, 'tag')

            expect(result).toBe(
                'Some products with this tag are already excluded: Product A is already excluded (via tag "clearance")',
            )
        })

        it('should limit displayed products for tag rules', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: Array.from({ length: 5 }, (_, i) => ({
                    productId: `${i + 1}`,
                    productName: `Product ${i + 1}`,
                    conflicts: [
                        {
                            type: 'tag',
                            action: 'promoted',
                            items: [{ target: 'featured' }],
                        },
                    ],
                })),
            }

            const result = formatConflictMessage(conflictData, 'tag')

            expect(result).toBe(
                'Some products with this tag are already promoted: Product 1 is already promoted (via tag "featured"), Product 2 is already promoted (via tag "featured"), Product 3 is already promoted (via tag "featured") (+2 more)',
            )
        })

        it('should show hints for product rule conflicts when using tag rules', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [
                    {
                        productId: '123',
                        productName: 'Product A',
                        conflicts: [
                            {
                                type: 'product',
                                action: 'promoted',
                                items: [{ target: '123' }],
                            },
                        ],
                    },
                    {
                        productId: '124',
                        productName: 'Product B',
                        conflicts: [
                            {
                                type: 'vendor',
                                action: 'excluded',
                                items: [{ target: 'BadVendor' }],
                            },
                        ],
                    },
                ],
            }

            const result = formatConflictMessage(conflictData, 'tag')

            expect(result).toBe(
                'Some products with this tag are already promoted: Product A is already promoted (via product rule), Product B is already excluded (via vendor "BadVendor")',
            )
        })
    })

    describe('vendor rule conflicts', () => {
        it('should format conflicts when applying a vendor rule to products', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [
                    {
                        productId: '123',
                        productName: 'Product A',
                        conflicts: [
                            {
                                type: 'vendor',
                                action: 'promoted',
                                items: [{ target: 'Acme Corp' }],
                            },
                        ],
                    },
                    {
                        productId: '124',
                        productName: 'Product B',
                        conflicts: [
                            {
                                type: 'vendor',
                                action: 'promoted',
                                items: [{ target: 'Acme Corp' }],
                            },
                        ],
                    },
                ],
            }

            const result = formatConflictMessage(conflictData, 'vendor')

            expect(result).toBe(
                'Some products with this vendor are already promoted: Product A is already promoted (via vendor "Acme Corp"), Product B is already promoted (via vendor "Acme Corp")',
            )
        })

        it('should handle vendor conflicts with excluded action', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [
                    {
                        productId: '123',
                        productName: 'Product A',
                        conflicts: [
                            {
                                type: 'vendor',
                                action: 'excluded',
                                items: [{ target: 'BadVendor' }],
                            },
                        ],
                    },
                ],
            }

            const result = formatConflictMessage(conflictData, 'vendor')

            expect(result).toBe(
                'Some products with this vendor are already excluded: Product A is already excluded (via vendor "BadVendor")',
            )
        })

        it('should limit displayed products for vendor rules', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: Array.from({ length: 5 }, (_, i) => ({
                    productId: `${i + 1}`,
                    productName: `Product ${i + 1}`,
                    conflicts: [
                        {
                            type: 'vendor',
                            action: 'promoted',
                            items: [{ target: 'BigVendor' }],
                        },
                    ],
                })),
            }

            const result = formatConflictMessage(conflictData, 'vendor')

            expect(result).toBe(
                'Some products with this vendor are already promoted: Product 1 is already promoted (via vendor "BigVendor"), Product 2 is already promoted (via vendor "BigVendor"), Product 3 is already promoted (via vendor "BigVendor") (+2 more)',
            )
        })

        it('should show hints for product and tag rule conflicts when using vendor rules', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [
                    {
                        productId: '123',
                        productName: 'Product A',
                        conflicts: [
                            {
                                type: 'product',
                                action: 'promoted',
                                items: [{ target: '123' }],
                            },
                        ],
                    },
                    {
                        productId: '124',
                        productName: 'Product B',
                        conflicts: [
                            {
                                type: 'tag',
                                action: 'excluded',
                                items: [{ target: 'clearance' }],
                            },
                        ],
                    },
                ],
            }

            const result = formatConflictMessage(conflictData, 'vendor')

            expect(result).toBe(
                'Some products with this vendor are already promoted: Product A is already promoted (via product rule), Product B is already excluded (via tag "clearance")',
            )
        })
    })

    describe('edge cases', () => {
        it('should handle empty conflict data', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [],
            }

            const result = formatConflictMessage(conflictData, 'product')

            expect(result).toBe(
                'Failed to save product recommendations due to conflicts.',
            )
        })

        it('should handle product without name', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [
                    {
                        productId: '123',
                        productName: '',
                        conflicts: [
                            {
                                type: 'product',
                                action: 'promoted',
                                items: [{ target: '123' }],
                            },
                        ],
                    },
                ],
            }

            const result = formatConflictMessage(conflictData, 'product')

            expect(result).toBe('Conflict found: Product is already promoted')
        })

        it('should handle special characters in names', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [
                    {
                        productId: '123',
                        productName: 'Product & "Special" <Characters>',
                        conflicts: [
                            {
                                type: 'product',
                                action: 'promoted',
                                items: [{ target: '123' }],
                            },
                        ],
                    },
                ],
            }

            const result = formatConflictMessage(conflictData, 'product')

            expect(result).toBe(
                'Conflict found: Product & "Special" <Characters> is already promoted',
            )
        })

        it('should handle products without names for vendor rules', () => {
            const conflictData: ProductRecommendationConflictError = {
                productConflicts: [
                    {
                        productId: '123',
                        productName: '',
                        conflicts: [
                            {
                                type: 'vendor',
                                action: 'promoted',
                                items: [{ target: 'Vendor' }],
                            },
                        ],
                    },
                    {
                        productId: '124',
                        productName: '',
                        conflicts: [
                            {
                                type: 'vendor',
                                action: 'promoted',
                                items: [{ target: 'Vendor' }],
                            },
                        ],
                    },
                ],
            }

            const result = formatConflictMessage(conflictData, 'vendor')

            expect(result).toBe(
                'Some products with this vendor are already promoted: Product ID: 123 is already promoted (via vendor "Vendor"), Product ID: 124 is already promoted (via vendor "Vendor")',
            )
        })
    })
})
