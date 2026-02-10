import { List } from 'immutable'

import type { ShopifyIntegration } from 'models/integration/types'
import { IdentifierCategoryKey } from 'models/rule/types'
import type { Field } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/MetafieldsTable/types'

import {
    applyMetafieldWidgetConfig,
    extractIntegrationIdFromTree,
    extractMetafieldCategoryFromTree,
    extractMetafieldKeyFromTree,
    filterSupportedMetafields,
    findMetafieldByKey,
    findStoreById,
    getActiveIntegrationId,
    getDisplayStoreName,
    getMetafieldCategoryType,
    getMetafieldOperatorOptions,
    hasMetafieldInPath,
    isMetafieldCategory,
    parsePathToExpressionSegments,
} from './utils'

function createMockShopifyIntegration(
    overrides?: Partial<ShopifyIntegration>,
): ShopifyIntegration {
    return {
        id: 123,
        name: 'Test Store',
        type: 'shopify',
        created_datetime: '2024-01-01T00:00:00Z',
        deactivated_datetime: null,
        decoration: null,
        deleted_datetime: null,
        description: null,
        locked_datetime: null,
        mappings: null,
        updated_datetime: '2024-01-01T00:00:00Z',
        uri: '/api/integrations/123',
        user: { id: 1 },
        managed: false,
        meta: {
            oauth: {
                access_token: 'test-token',
                refresh_token: null,
            },
            shop_name: 'test-store.myshopify.com',
            webhooks: [],
        },
        ...overrides,
    } as ShopifyIntegration
}

function createMockField(overrides?: Partial<Field>): Field {
    return {
        id: '1',
        key: 'test_key',
        name: 'Test Field',
        type: 'single_line_text_field',
        category: 'Customer',
        isVisible: true,
        ...overrides,
    }
}

describe('parsePathToExpressionSegments', () => {
    it.each([
        {
            scenario: 'simple path without brackets',
            input: 'ticket.customer.name',
            expected: ['ticket', 'customer', 'name'],
        },
        {
            scenario: 'path with single bracket notation',
            input: 'ticket.customer.integrations[123].customer.metafields',
            expected: [
                'ticket',
                'customer',
                'integrations',
                '123',
                'customer',
                'metafields',
            ],
        },
        {
            scenario: 'path with multiple bracket notations',
            input: 'ticket.customer.integrations[123].orders[0].metafields',
            expected: [
                'ticket',
                'customer',
                'integrations',
                '123',
                'orders',
                '0',
                'metafields',
            ],
        },
        {
            scenario: 'nested path with draft_orders',
            input: 'ticket.customer.integrations[456].draft_orders[0].metafields.key.value',
            expected: [
                'ticket',
                'customer',
                'integrations',
                '456',
                'draft_orders',
                '0',
                'metafields',
                'key',
                'value',
            ],
        },
        {
            scenario: 'empty path',
            input: '',
            expected: [''],
        },
        {
            scenario: 'single segment',
            input: 'ticket',
            expected: ['ticket'],
        },
    ])('$scenario', ({ input, expected }) => {
        expect(parsePathToExpressionSegments(input)).toEqual(expected)
    })
})

describe('hasMetafieldInPath', () => {
    it.each([
        {
            scenario: 'returns true for path with .metafields.',
            input: List(['customer', 'metafields', 'key']),
            expected: true,
        },
        {
            scenario: 'returns true for integrations path with metafields',
            input: List([
                'ticket',
                'customer',
                'integrations',
                '123',
                'customer',
                'metafields',
                'vip',
            ]),
            expected: true,
        },
        {
            scenario: 'returns false for path without metafields',
            input: List(['ticket', 'customer', 'name']),
            expected: false,
        },
        {
            scenario: 'returns false for path ending with metafields',
            input: List(['customer', 'metafields']),
            expected: false,
        },
        {
            scenario: 'returns false for null input',
            input: null,
            expected: false,
        },
    ])('$scenario', ({ input, expected }) => {
        expect(hasMetafieldInPath(input)).toBe(expected)
    })
})

describe('extractMetafieldKeyFromTree', () => {
    it.each([
        {
            scenario: 'extracts key after metafields',
            input: List([
                'customer',
                'integrations',
                '123',
                'customer',
                'metafields',
                'vip_status',
                'value',
            ]),
            hasMetafield: true,
            expected: 'vip_status',
        },
        {
            scenario: 'returns null when key is "value"',
            input: List(['customer', 'metafields', 'value']),
            hasMetafield: true,
            expected: null,
        },
        {
            scenario: 'returns null when no metafields in tree',
            input: List(['ticket', 'customer', 'name']),
            hasMetafield: false,
            expected: null,
        },
        {
            scenario: 'returns null when hasMetafieldInTree is false',
            input: List(['customer', 'metafields', 'key']),
            hasMetafield: false,
            expected: null,
        },
        {
            scenario: 'returns null for null input',
            input: null,
            hasMetafield: true,
            expected: null,
        },
        {
            scenario: 'returns null when nothing after metafields',
            input: List(['customer', 'metafields']),
            hasMetafield: true,
            expected: null,
        },
    ])('$scenario', ({ input, hasMetafield, expected }) => {
        expect(extractMetafieldKeyFromTree(input, hasMetafield)).toBe(expected)
    })
})

describe('extractMetafieldCategoryFromTree', () => {
    it.each([
        {
            scenario: 'returns Customer for shopify.customer.metafields path',
            input: List(['shopify', 'customer', 'metafields', 'key']),
            hasMetafield: true,
            expected: 'Customer',
        },
        {
            scenario:
                'returns Customer for integrations pattern customer.metafields',
            input: List([
                'ticket',
                'customer',
                'integrations',
                '123',
                'customer',
                'metafields',
                'key',
            ]),
            hasMetafield: true,
            expected: 'Customer',
        },
        {
            scenario: 'returns Order for shopify.last_order.metafields path',
            input: List(['shopify', 'last_order', 'metafields', 'key']),
            hasMetafield: true,
            expected: 'Order',
        },
        {
            scenario:
                'returns Order for integrations pattern orders.0.metafields',
            input: List([
                'ticket',
                'customer',
                'integrations',
                '456',
                'orders',
                '0',
                'metafields',
                'key',
            ]),
            hasMetafield: true,
            expected: 'Order',
        },
        {
            scenario:
                'returns DraftOrder for shopify.last_draft_order.metafields path',
            input: List(['shopify', 'last_draft_order', 'metafields', 'key']),
            hasMetafield: true,
            expected: 'DraftOrder',
        },
        {
            scenario:
                'returns DraftOrder for integrations pattern draft_orders.0.metafields',
            input: List([
                'ticket',
                'customer',
                'integrations',
                '789',
                'draft_orders',
                '0',
                'metafields',
                'key',
            ]),
            hasMetafield: true,
            expected: 'DraftOrder',
        },
        {
            scenario: 'returns null for non-metafield path',
            input: List(['ticket', 'customer', 'name']),
            hasMetafield: true,
            expected: null,
        },
        {
            scenario: 'returns null when hasMetafieldInTree is false',
            input: List(['shopify', 'customer', 'metafields', 'key']),
            hasMetafield: false,
            expected: null,
        },
        {
            scenario: 'returns null for null input',
            input: null,
            hasMetafield: true,
            expected: null,
        },
    ])('$scenario', ({ input, hasMetafield, expected }) => {
        expect(extractMetafieldCategoryFromTree(input, hasMetafield)).toBe(
            expected,
        )
    })
})

describe('extractIntegrationIdFromTree', () => {
    it.each([
        {
            scenario: 'extracts ID from integrations path',
            input: List([
                'ticket',
                'customer',
                'integrations',
                '123',
                'customer',
                'metafields',
            ]),
            expected: 123,
        },
        {
            scenario: 'extracts multi-digit ID',
            input: List([
                'ticket',
                'customer',
                'integrations',
                '98765',
                'orders',
                '0',
            ]),
            expected: 98765,
        },
        {
            scenario: 'returns null for path without integrations',
            input: List(['shopify', 'customer', 'metafields', 'key']),
            expected: null,
        },
        {
            scenario: 'returns null for null input',
            input: null,
            expected: null,
        },
        {
            scenario:
                'returns null when integrations not followed by number and dot',
            input: List(['integrations', 'test']),
            expected: null,
        },
    ])('$scenario', ({ input, expected }) => {
        expect(extractIntegrationIdFromTree(input)).toBe(expected)
    })
})

describe('getDisplayStoreName', () => {
    it.each([
        {
            scenario: 'returns selectedStore.name when selectedStore is set',
            selectedStore: createMockShopifyIntegration({
                id: 111,
                name: 'Selected Store',
            }),
            integrationIdFromTree: 222,
            shopifyIntegrations: [
                createMockShopifyIntegration({ id: 222, name: 'Tree Store' }),
            ],
            expected: 'Selected Store',
        },
        {
            scenario: 'returns matching store name from integrationIdFromTree',
            selectedStore: null,
            integrationIdFromTree: 456,
            shopifyIntegrations: [
                createMockShopifyIntegration({
                    id: 456,
                    name: 'Matching Store',
                }),
            ],
            expected: 'Matching Store',
        },
        {
            scenario:
                'returns null when no match found for integrationIdFromTree',
            selectedStore: null,
            integrationIdFromTree: 456,
            shopifyIntegrations: [
                createMockShopifyIntegration({ id: 999, name: 'Other Store' }),
            ],
            expected: null,
        },
        {
            scenario:
                'returns null when no integrationIdFromTree and no selectedStore',
            selectedStore: null,
            integrationIdFromTree: null,
            shopifyIntegrations: [
                createMockShopifyIntegration({ id: 123, name: 'Some Store' }),
            ],
            expected: null,
        },
    ])(
        '$scenario',
        ({
            selectedStore,
            integrationIdFromTree,
            shopifyIntegrations,
            expected,
        }) => {
            expect(
                getDisplayStoreName(
                    selectedStore,
                    integrationIdFromTree,
                    shopifyIntegrations,
                ),
            ).toBe(expected)
        },
    )
})

describe('getActiveIntegrationId', () => {
    it.each([
        {
            scenario: 'uses selectedStoreId when available',
            selectedStoreId: 111,
            integrationIdFromTree: 222,
            firstIntegrationId: 333,
            expected: 111,
        },
        {
            scenario:
                'falls back to integrationIdFromTree when no selectedStoreId',
            selectedStoreId: undefined,
            integrationIdFromTree: 222,
            firstIntegrationId: 333,
            expected: 222,
        },
        {
            scenario:
                'falls back to firstIntegrationId when no selectedStoreId or tree ID',
            selectedStoreId: undefined,
            integrationIdFromTree: null,
            firstIntegrationId: 333,
            expected: 333,
        },
        {
            scenario: 'returns undefined when no integrations available',
            selectedStoreId: undefined,
            integrationIdFromTree: null,
            firstIntegrationId: undefined,
            expected: undefined,
        },
    ])(
        '$scenario',
        ({
            selectedStoreId,
            integrationIdFromTree,
            firstIntegrationId,
            expected,
        }) => {
            expect(
                getActiveIntegrationId(
                    selectedStoreId,
                    integrationIdFromTree,
                    firstIntegrationId,
                ),
            ).toBe(expected)
        },
    )
})

describe('filterSupportedMetafields', () => {
    it.each([
        { type: 'single_line_text_field' as const, shouldBeIncluded: true },
        { type: 'multi_line_text_field' as const, shouldBeIncluded: true },
        { type: 'boolean' as const, shouldBeIncluded: true },
        { type: 'number_integer' as const, shouldBeIncluded: true },
        { type: 'number_decimal' as const, shouldBeIncluded: true },
        { type: 'url' as const, shouldBeIncluded: true },
        { type: 'date' as const, shouldBeIncluded: true },
        { type: 'date_time' as const, shouldBeIncluded: true },
        { type: 'json' as const, shouldBeIncluded: false },
        { type: 'file_reference' as const, shouldBeIncluded: false },
    ])(
        'metafield with type $type should be included=$shouldBeIncluded',
        ({ type, shouldBeIncluded }) => {
            const metafields = [createMockField({ type })]
            const result = filterSupportedMetafields(metafields)

            if (shouldBeIncluded) {
                expect(result).toHaveLength(1)
                expect(result[0].type).toBe(type)
            } else {
                expect(result).toHaveLength(0)
            }
        },
    )

    it('filters out unsupported types from mixed list', () => {
        const metafields = [
            createMockField({ id: '1', type: 'single_line_text_field' }),
            createMockField({ id: '2', type: 'json' }),
            createMockField({ id: '3', type: 'boolean' }),
            createMockField({ id: '4', type: 'file_reference' }),
        ]

        const result = filterSupportedMetafields(metafields)

        expect(result).toHaveLength(2)
        expect(result.map((f) => f.id)).toEqual(['1', '3'])
    })
})

describe('findStoreById', () => {
    it.each([
        {
            scenario: 'finds store when ID matches',
            integrations: [
                createMockShopifyIntegration({ id: 123, name: 'Store A' }),
                createMockShopifyIntegration({ id: 456, name: 'Store B' }),
            ],
            id: 456,
            expectedName: 'Store B',
        },
        {
            scenario: 'returns undefined when ID does not match',
            integrations: [
                createMockShopifyIntegration({ id: 123, name: 'Store A' }),
            ],
            id: 999,
            expectedName: undefined,
        },
        {
            scenario: 'returns undefined for empty integrations',
            integrations: [],
            id: 123,
            expectedName: undefined,
        },
    ])('$scenario', ({ integrations, id, expectedName }) => {
        const result = findStoreById(integrations, id)
        expect(result?.name).toBe(expectedName)
    })
})

describe('findMetafieldByKey', () => {
    it.each([
        {
            scenario: 'finds metafield when key matches',
            metafields: [
                createMockField({ key: 'vip_status', name: 'VIP Status' }),
                createMockField({
                    key: 'loyalty_points',
                    name: 'Loyalty Points',
                }),
            ],
            key: 'loyalty_points',
            expectedName: 'Loyalty Points',
        },
        {
            scenario: 'returns undefined when key does not match',
            metafields: [
                createMockField({ key: 'vip_status', name: 'VIP Status' }),
            ],
            key: 'non_existent',
            expectedName: undefined,
        },
        {
            scenario: 'returns undefined for empty metafields',
            metafields: [],
            key: 'any_key',
            expectedName: undefined,
        },
    ])('$scenario', ({ metafields, key, expectedName }) => {
        const result = findMetafieldByKey(metafields, key)
        expect(result?.name).toBe(expectedName)
    })
})

describe('isMetafieldCategory', () => {
    it.each([
        {
            category: IdentifierCategoryKey.ShopifyCustomerMetafields,
            expected: true,
        },
        {
            category: IdentifierCategoryKey.ShopifyLastOrderMetafields,
            expected: true,
        },
        {
            category: IdentifierCategoryKey.ShopifyLastDraftOrderMetafields,
            expected: true,
        },
        { category: IdentifierCategoryKey.Ticket, expected: false },
        { category: IdentifierCategoryKey.Customer, expected: false },
    ])('returns $expected for $category', ({ category, expected }) => {
        expect(isMetafieldCategory(category)).toBe(expected)
    })
})

describe('getMetafieldCategoryType', () => {
    it.each([
        {
            category: IdentifierCategoryKey.ShopifyCustomerMetafields,
            expected: 'Customer',
        },
        {
            category: IdentifierCategoryKey.ShopifyLastOrderMetafields,
            expected: 'Order',
        },
        {
            category: IdentifierCategoryKey.ShopifyLastDraftOrderMetafields,
            expected: 'DraftOrder',
        },
        { category: IdentifierCategoryKey.Ticket, expected: null },
    ])('returns $expected for $category', ({ category, expected }) => {
        expect(getMetafieldCategoryType(category)).toBe(expected)
    })
})

describe('getMetafieldOperatorOptions', () => {
    it.each([
        {
            scenario: 'returns text operators for single_line_text_field',
            metafieldType: 'single_line_text_field' as const,
            expectedOperators: [
                'eq',
                'neq',
                'contains',
                'notContains',
                'startsWith',
                'endsWith',
                'containsAll',
                'containsAny',
                'notContainsAll',
                'notContainsAny',
            ],
        },
        {
            scenario: 'returns numeric operators for number_integer',
            metafieldType: 'number_integer' as const,
            expectedOperators: ['eq', 'neq', 'lt', 'lte', 'gt', 'gte'],
        },
        {
            scenario: 'returns boolean operators for boolean',
            metafieldType: 'boolean' as const,
            expectedOperators: ['eq', 'neq'],
        },
        {
            scenario: 'returns date operators for date',
            metafieldType: 'date' as const,
            expectedOperators: ['gte', 'lte', 'gteTimedelta', 'lteTimedelta'],
        },
    ])('$scenario', ({ metafieldType, expectedOperators }) => {
        const result = getMetafieldOperatorOptions(metafieldType)

        expect(result.map((opt) => opt.value)).toEqual(expectedOperators)
        result.forEach((opt) => {
            expect(opt).toHaveProperty('value')
            expect(opt).toHaveProperty('label')
            expect(typeof opt.label).toBe('string')
        })
    })

    it('returns options with correct label format', () => {
        const result = getMetafieldOperatorOptions('single_line_text_field')

        expect(result).toContainEqual({ value: 'eq', label: 'is' })
        expect(result).toContainEqual({ value: 'neq', label: 'is not' })
        expect(result).toContainEqual({ value: 'contains', label: 'contains' })
    })

    it('returns basic operators when metafieldType is undefined', () => {
        const result = getMetafieldOperatorOptions(undefined)

        expect(result.length).toBeGreaterThan(0)
        result.forEach((opt) => {
            expect(opt).toHaveProperty('value')
            expect(opt).toHaveProperty('label')
        })
    })
})

describe('applyMetafieldWidgetConfig', () => {
    it.each([
        {
            scenario: 'applies boolean config with select type and options',
            metafieldType: 'boolean' as const,
            operatorName: 'eq',
            initialWidget: { type: 'input' },
            expectedType: 'select',
            expectedOptions: [
                { value: 'true', label: 'True' },
                { value: 'false', label: 'False' },
            ],
        },
        {
            scenario: 'applies number-input type for number_integer',
            metafieldType: 'number_integer' as const,
            operatorName: 'eq',
            initialWidget: { type: 'input' },
            expectedType: 'number-input',
            expectedOptions: undefined,
        },
        {
            scenario: 'applies number-input type for number_decimal',
            metafieldType: 'number_decimal' as const,
            operatorName: 'eq',
            initialWidget: { type: 'input' },
            expectedType: 'number-input',
            expectedOptions: undefined,
        },
        {
            scenario: 'applies datetime-select type for date',
            metafieldType: 'date' as const,
            operatorName: 'gte',
            initialWidget: { type: 'input' },
            expectedType: 'datetime-select',
            expectedOptions: undefined,
        },
        {
            scenario: 'applies datetime-select type for date_time',
            metafieldType: 'date_time' as const,
            operatorName: 'lte',
            initialWidget: { type: 'input' },
            expectedType: 'datetime-select',
            expectedOptions: undefined,
        },
    ])(
        '$scenario',
        ({
            metafieldType,
            operatorName,
            initialWidget,
            expectedType,
            expectedOptions,
        }) => {
            const result = applyMetafieldWidgetConfig(
                initialWidget,
                metafieldType,
                operatorName,
            )

            expect(result.type).toBe(expectedType)
            if (expectedOptions) {
                expect(result.options).toEqual(expectedOptions)
            } else {
                expect(result.options).toBeUndefined()
            }
        },
    )

    it('preserves existing options when config does not provide new options', () => {
        const existingOptions = [{ value: 'a', label: 'A' }]
        const widget = { type: 'input', options: existingOptions }
        const result = applyMetafieldWidgetConfig(
            widget,
            'number_integer',
            'eq',
        )

        expect(result.type).toBe('number-input')
        expect(result.options).toEqual(existingOptions)
    })

    it('returns original widget when metafieldType is undefined', () => {
        const widget = { type: 'input', options: [{ value: 'a', label: 'A' }] }
        const result = applyMetafieldWidgetConfig(widget, undefined, 'eq')

        expect(result).toEqual(widget)
    })

    it('returns original widget for unsupported metafield types', () => {
        const widget = { type: 'input', options: [] }
        const result = applyMetafieldWidgetConfig(
            widget,
            'single_line_text_field',
            'eq',
        )

        expect(result).toEqual(widget)
    })

    it('preserves other widget properties when applying config', () => {
        const widget = {
            type: 'input',
            options: [],
        } as any
        const result = applyMetafieldWidgetConfig(widget, 'boolean', 'eq')

        expect(result.type).toBe('select')
    })
})
