import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { IntegrationType } from 'models/integration/constants'
import type { ShopifyIntegration } from 'models/integration/types'
import { IdentifierCategoryKey } from 'models/rule/types'
import type { Field } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/MetafieldsTable/types'

import type { MetafieldCategoryOptionsProps } from '../types'
import { MetafieldCategoryOptions } from './MetafieldCategoryOptions'

jest.mock('reactstrap', () => ({
    ...jest.requireActual('reactstrap'),
    DropdownItem: ({
        children,
        onClick,
        className,
    }: {
        children: ReactNode
        onClick: () => void
        className?: string
    }) => (
        <button type="button" onClick={onClick} className={className}>
            {children}
        </button>
    ),
}))

function createMockShopifyIntegration(
    overrides?: Partial<ShopifyIntegration>,
): ShopifyIntegration {
    return {
        id: 123,
        name: 'Test Store',
        type: IntegrationType.Shopify,
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

const defaultProps: MetafieldCategoryOptionsProps = {
    selectedCategory: IdentifierCategoryKey.ShopifyCustomerMetafields,
    shopifyIntegrations: [],
    selectedStore: null,
    metafieldLevel: 'stores',
    metafields: [],
    isLoadingMetafields: false,
    onSelectStore: jest.fn(),
    onBackToStores: jest.fn(),
    onSelectMetafield: jest.fn(),
}

const renderComponent = (
    props: Partial<MetafieldCategoryOptionsProps> = {},
) => {
    const mergedProps = { ...defaultProps, ...props }
    return render(<MetafieldCategoryOptions {...mergedProps} />)
}

describe('MetafieldCategoryOptions', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Level 1: Stores View (metafieldLevel === "stores")', () => {
        it('renders "No Shopify stores found" when shopifyIntegrations is empty', () => {
            renderComponent({
                metafieldLevel: 'stores',
                shopifyIntegrations: [],
            })

            expect(screen.getByText('No Shopify stores found')).toBeVisible()
        })

        it('renders all stores with correct names', () => {
            const stores = [
                createMockShopifyIntegration({ id: 1, name: 'Store One' }),
                createMockShopifyIntegration({ id: 2, name: 'Store Two' }),
                createMockShopifyIntegration({ id: 3, name: 'Store Three' }),
            ]

            renderComponent({
                metafieldLevel: 'stores',
                shopifyIntegrations: stores,
            })

            expect(screen.getByText('Store One')).toBeVisible()
            expect(screen.getByText('Store Two')).toBeVisible()
            expect(screen.getByText('Store Three')).toBeVisible()
        })

        it('calls onSelectStore with correct store when clicked', async () => {
            const user = userEvent.setup()
            const onSelectStore = jest.fn()
            const stores = [
                createMockShopifyIntegration({ id: 1, name: 'Store One' }),
                createMockShopifyIntegration({ id: 2, name: 'Store Two' }),
            ]

            renderComponent({
                metafieldLevel: 'stores',
                shopifyIntegrations: stores,
                onSelectStore,
            })

            await user.click(screen.getByText('Store Two'))

            expect(onSelectStore).toHaveBeenCalledTimes(1)
            expect(onSelectStore).toHaveBeenCalledWith(stores[1])
        })

        it('displays right arrow icon for each store option', () => {
            const stores = [
                createMockShopifyIntegration({ id: 1, name: 'Store One' }),
                createMockShopifyIntegration({ id: 2, name: 'Store Two' }),
            ]

            renderComponent({
                metafieldLevel: 'stores',
                shopifyIntegrations: stores,
            })

            const arrows = screen.getAllByText('keyboard_arrow_right')
            expect(arrows).toHaveLength(2)
        })
    })

    describe('Level 2: Metafields View (metafieldLevel === "metafields")', () => {
        it('displays back button with selected store name', () => {
            const selectedStore = createMockShopifyIntegration({
                name: 'My Test Store',
            })

            renderComponent({
                metafieldLevel: 'metafields',
                selectedStore,
            })

            expect(screen.getByText('My Test Store')).toBeVisible()
            expect(screen.getByText('arrow_back')).toBeVisible()
        })

        it('calls onBackToStores when back button is clicked', async () => {
            const user = userEvent.setup()
            const onBackToStores = jest.fn()
            const selectedStore = createMockShopifyIntegration({
                name: 'My Store',
            })

            renderComponent({
                metafieldLevel: 'metafields',
                selectedStore,
                onBackToStores,
            })

            await user.click(screen.getByText('My Store'))

            expect(onBackToStores).toHaveBeenCalledTimes(1)
        })

        it('displays "Loading metafields..." when isLoadingMetafields is true', () => {
            const selectedStore = createMockShopifyIntegration()

            renderComponent({
                metafieldLevel: 'metafields',
                selectedStore,
                isLoadingMetafields: true,
            })

            expect(screen.getByText('Loading metafields...')).toBeVisible()
        })

        it('displays "No metafields found" when no metafields match category', () => {
            const selectedStore = createMockShopifyIntegration()

            renderComponent({
                metafieldLevel: 'metafields',
                selectedStore,
                selectedCategory:
                    IdentifierCategoryKey.ShopifyCustomerMetafields,
                metafields: [
                    createMockField({ category: 'Order', name: 'Order Field' }),
                ],
                isLoadingMetafields: false,
            })

            expect(screen.getByText('No metafields found')).toBeVisible()
        })

        it('only renders metafields matching the selected category', () => {
            const selectedStore = createMockShopifyIntegration()
            const metafields = [
                createMockField({
                    id: '1',
                    name: 'Customer Field',
                    category: 'Customer',
                }),
                createMockField({
                    id: '2',
                    name: 'Order Field',
                    category: 'Order',
                }),
                createMockField({
                    id: '3',
                    name: 'Another Customer Field',
                    category: 'Customer',
                }),
            ]

            renderComponent({
                metafieldLevel: 'metafields',
                selectedStore,
                selectedCategory:
                    IdentifierCategoryKey.ShopifyCustomerMetafields,
                metafields,
                isLoadingMetafields: false,
            })

            expect(screen.getByText('Customer Field')).toBeVisible()
            expect(screen.getByText('Another Customer Field')).toBeVisible()
            expect(screen.queryByText('Order Field')).not.toBeInTheDocument()
        })

        it('calls onSelectMetafield with correct field and category when clicked', async () => {
            const user = userEvent.setup()
            const onSelectMetafield = jest.fn()
            const selectedStore = createMockShopifyIntegration()
            const customerField = createMockField({
                id: '1',
                name: 'Customer VIP Status',
                category: 'Customer',
            })

            renderComponent({
                metafieldLevel: 'metafields',
                selectedStore,
                selectedCategory:
                    IdentifierCategoryKey.ShopifyCustomerMetafields,
                metafields: [customerField],
                isLoadingMetafields: false,
                onSelectMetafield,
            })

            await user.click(screen.getByText('Customer VIP Status'))

            expect(onSelectMetafield).toHaveBeenCalledTimes(1)
            expect(onSelectMetafield).toHaveBeenCalledWith(
                customerField,
                'Customer',
            )
        })
    })

    describe('Category Filtering', () => {
        const metafields = [
            createMockField({
                id: '1',
                name: 'Customer Field 1',
                category: 'Customer',
            }),
            createMockField({
                id: '2',
                name: 'Customer Field 2',
                category: 'Customer',
            }),
            createMockField({
                id: '3',
                name: 'Order Field 1',
                category: 'Order',
            }),
            createMockField({
                id: '4',
                name: 'Order Field 2',
                category: 'Order',
            }),
            createMockField({
                id: '5',
                name: 'DraftOrder Field 1',
                category: 'DraftOrder',
            }),
            createMockField({
                id: '6',
                name: 'DraftOrder Field 2',
                category: 'DraftOrder',
            }),
        ]

        it.each([
            {
                category: IdentifierCategoryKey.ShopifyCustomerMetafields,
                expectedFields: ['Customer Field 1', 'Customer Field 2'],
                unexpectedFields: [
                    'Order Field 1',
                    'Order Field 2',
                    'DraftOrder Field 1',
                    'DraftOrder Field 2',
                ],
            },
            {
                category: IdentifierCategoryKey.ShopifyLastOrderMetafields,
                expectedFields: ['Order Field 1', 'Order Field 2'],
                unexpectedFields: [
                    'Customer Field 1',
                    'Customer Field 2',
                    'DraftOrder Field 1',
                    'DraftOrder Field 2',
                ],
            },
            {
                category: IdentifierCategoryKey.ShopifyLastDraftOrderMetafields,
                expectedFields: ['DraftOrder Field 1', 'DraftOrder Field 2'],
                unexpectedFields: [
                    'Customer Field 1',
                    'Customer Field 2',
                    'Order Field 1',
                    'Order Field 2',
                ],
            },
        ])(
            'filters and displays only $category metafields',
            ({ category, expectedFields, unexpectedFields }) => {
                const selectedStore = createMockShopifyIntegration()

                renderComponent({
                    metafieldLevel: 'metafields',
                    selectedStore,
                    selectedCategory: category,
                    metafields,
                    isLoadingMetafields: false,
                })

                for (const fieldName of expectedFields) {
                    expect(screen.getByText(fieldName)).toBeVisible()
                }

                for (const fieldName of unexpectedFields) {
                    expect(
                        screen.queryByText(fieldName),
                    ).not.toBeInTheDocument()
                }
            },
        )
    })
})
