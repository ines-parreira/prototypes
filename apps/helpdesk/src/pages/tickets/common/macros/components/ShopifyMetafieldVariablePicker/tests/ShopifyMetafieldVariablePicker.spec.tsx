import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import { ThemeProvider } from 'core/theme'
import useAppSelector from 'hooks/useAppSelector'
import type { ShopifyIntegration } from 'models/integration/types'
import { useMetafieldDefinitions } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/hooks/useMetafieldDefinitions'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'
import { mockStore } from 'utils/testing'

import { ShopifyMetafieldVariablePicker } from '../ShopifyMetafieldVariablePicker'

jest.mock('hooks/useAppSelector')
jest.mock(
    'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/hooks/useMetafieldDefinitions',
)

const mockUseAppSelector = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>
const mockUseMetafieldDefinitions =
    useMetafieldDefinitions as jest.MockedFunction<
        typeof useMetafieldDefinitions
    >

const createMockStore = (
    overrides: Partial<ShopifyIntegration> = {},
): ShopifyIntegration =>
    ({
        id: 1,
        name: 'Test Store',
        type: 'shopify',
        ...overrides,
    }) as ShopifyIntegration

const mockMetafields = [
    {
        id: '1',
        key: 'loyalty_points',
        name: 'Loyalty Points',
        type: 'number_integer' as const,
        category: 'Customer' as const,
        isVisible: true,
    },
    {
        id: '2',
        key: 'tracking_number',
        name: 'Tracking Number',
        type: 'single_line_text_field' as const,
        category: 'Order' as const,
        isVisible: true,
    },
]

const defaultProps = {
    onSelect: jest.fn(),
    onCloseParentMenu: jest.fn(),
}

const renderComponent = (props: Partial<typeof defaultProps> = {}) => {
    return render(
        <Provider store={mockStore({})}>
            <ThemeProvider>
                <ShopifyMetafieldVariablePicker {...defaultProps} {...props} />
            </ThemeProvider>
        </Provider>,
    )
}

const clickButtonWithText = async (
    user: ReturnType<typeof userEvent.setup>,
    text: string,
) => {
    const element = screen.getByText(text)
    const button =
        element.closest('button') ?? element.closest('[role="button"]')
    if (!button)
        throw new Error(`Could not find button containing text "${text}"`)
    await user.click(button)
}

describe('<ShopifyMetafieldVariablePicker />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseMetafieldDefinitions.mockReturnValue({
            data: mockMetafields,
            isLoading: false,
            isError: false,
            error: null,
        })
    })

    describe('when no Shopify integrations exist', () => {
        beforeEach(() => {
            mockUseAppSelector.mockImplementation((selector: any) => {
                if (selector === getCurrentAccountId) {
                    return 1
                }
                if (selector === getCurrentUserId) {
                    return 2
                }
                if (selector === getShopifyIntegrationsSortedByName) {
                    return []
                }
                return []
            })
        })

        it('returns null', () => {
            const { container } = renderComponent()

            expect(container).toBeEmptyDOMElement()
        })
    })

    describe('when Shopify integrations exist', () => {
        const mockStores = [
            createMockStore({ id: 1, name: 'Store 1' }),
            createMockStore({ id: 2, name: 'Store 2' }),
        ]

        beforeEach(() => {
            mockUseAppSelector.mockImplementation((selector: any) => {
                if (selector === getCurrentAccountId) {
                    return 1
                }
                if (selector === getCurrentUserId) {
                    return 2
                }
                if (selector === getShopifyIntegrationsSortedByName) {
                    return mockStores
                }
                return []
            })
        })

        it('renders trigger button with "Shopify metafields" text', () => {
            renderComponent()

            expect(screen.getByText('Shopify metafields')).toBeInTheDocument()
        })

        it('opens submenu when trigger is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await clickButtonWithText(user, 'Shopify metafields')

            expect(screen.getByText('Store 1')).toBeInTheDocument()
            expect(screen.getByText('Store 2')).toBeInTheDocument()
        })

        it('shows list of stores at stores level', async () => {
            const user = userEvent.setup()
            renderComponent()

            await clickButtonWithText(user, 'Shopify metafields')

            const storesList = screen
                .getByText('Store 1')
                .closest('.storesList') as HTMLElement
            expect(storesList).toBeInTheDocument()
            expect(within(storesList).getByText('Store 1')).toBeInTheDocument()
            expect(within(storesList).getByText('Store 2')).toBeInTheDocument()
        })

        it('navigates to categories when store is selected', async () => {
            const user = userEvent.setup()
            renderComponent()

            await clickButtonWithText(user, 'Shopify metafields')
            await clickButtonWithText(user, 'Store 1')

            expect(screen.getByText('Customer')).toBeInTheDocument()
            expect(screen.getByText('Last Order')).toBeInTheDocument()
            expect(screen.getByText('Last Draft Order')).toBeInTheDocument()
        })

        it('shows back button with store name at categories level', async () => {
            const user = userEvent.setup()
            renderComponent()

            await clickButtonWithText(user, 'Shopify metafields')
            await clickButtonWithText(user, 'Store 1')

            const backHeader = screen
                .getByText('Store 1')
                .closest('.backHeader')
            expect(backHeader).toBeInTheDocument()
        })

        it('navigates to metafields when category is selected', async () => {
            const user = userEvent.setup()
            renderComponent()

            await clickButtonWithText(user, 'Shopify metafields')
            await clickButtonWithText(user, 'Store 1')
            await clickButtonWithText(user, 'Customer')

            expect(screen.getByText('Loyalty Points')).toBeInTheDocument()
        })

        it('shows back button with category name at metafields level', async () => {
            const user = userEvent.setup()
            renderComponent()

            await clickButtonWithText(user, 'Shopify metafields')
            await clickButtonWithText(user, 'Store 1')
            await clickButtonWithText(user, 'Customer')

            const backHeader = screen
                .getByText('Customer')
                .closest('.backHeader')
            expect(backHeader).toBeInTheDocument()
        })

        it('calls onSelect with correct variable value when metafield is selected', async () => {
            const user = userEvent.setup()
            const onSelect = jest.fn()
            renderComponent({ onSelect })

            await clickButtonWithText(user, 'Shopify metafields')
            await clickButtonWithText(user, 'Store 1')
            await clickButtonWithText(user, 'Customer')
            await clickButtonWithText(user, 'Loyalty Points')

            expect(onSelect).toHaveBeenCalledWith(
                '{{ticket.customer.integrations[1].customer.metafields.loyalty_points.value}}',
            )
        })

        it('calls onCloseParentMenu after metafield selection', async () => {
            const user = userEvent.setup()
            const onCloseParentMenu = jest.fn()
            renderComponent({ onCloseParentMenu })

            await clickButtonWithText(user, 'Shopify metafields')
            await clickButtonWithText(user, 'Store 1')
            await clickButtonWithText(user, 'Customer')
            await clickButtonWithText(user, 'Loyalty Points')

            expect(onCloseParentMenu).toHaveBeenCalled()
        })

        it('supports keyboard navigation with Enter key', async () => {
            const user = userEvent.setup()
            renderComponent()

            const trigger = screen
                .getByText('Shopify metafields')
                .closest('[role="button"]') as HTMLElement
            trigger.focus()
            await user.keyboard('{Enter}')

            await waitFor(() => {
                expect(screen.getByText('Store 1')).toBeInTheDocument()
            })
        })

        it('supports keyboard navigation with Space key', async () => {
            const user = userEvent.setup()
            renderComponent()

            const trigger = screen
                .getByText('Shopify metafields')
                .closest('[role="button"]') as HTMLElement
            trigger.focus()
            await user.keyboard(' ')

            await waitFor(() => {
                expect(screen.getByText('Store 1')).toBeInTheDocument()
            })
        })

        it('can navigate back from categories to stores', async () => {
            const user = userEvent.setup()
            renderComponent()

            await clickButtonWithText(user, 'Shopify metafields')
            await clickButtonWithText(user, 'Store 1')

            expect(screen.getByText('Customer')).toBeInTheDocument()

            const backButton = screen
                .getByText('Store 1')
                .closest('[role="button"]')!
            await user.click(backButton)

            const storesList = screen
                .getByText('Store 1')
                .closest('.storesList')
            expect(storesList).toBeInTheDocument()
        })

        it('can navigate back from metafields to categories', async () => {
            const user = userEvent.setup()
            renderComponent()

            await clickButtonWithText(user, 'Shopify metafields')
            await clickButtonWithText(user, 'Store 1')
            await clickButtonWithText(user, 'Customer')

            expect(screen.getByText('Loyalty Points')).toBeInTheDocument()

            const backButton = screen
                .getByText('Customer')
                .closest('[role="button"]')!
            await user.click(backButton)

            expect(screen.getByText('Last Order')).toBeInTheDocument()
        })
    })

    describe('when only one Shopify integration exists', () => {
        const singleStore = [createMockStore({ id: 1, name: 'Only Store' })]

        beforeEach(() => {
            mockUseAppSelector.mockImplementation((selector: any) => {
                if (selector === getCurrentAccountId) {
                    return 1
                }
                if (selector === getCurrentUserId) {
                    return 2
                }
                if (selector === getShopifyIntegrationsSortedByName) {
                    return singleStore
                }
                return []
            })
        })

        it('still renders trigger button', () => {
            renderComponent()

            expect(screen.getByText('Shopify metafields')).toBeInTheDocument()
        })
    })
})
