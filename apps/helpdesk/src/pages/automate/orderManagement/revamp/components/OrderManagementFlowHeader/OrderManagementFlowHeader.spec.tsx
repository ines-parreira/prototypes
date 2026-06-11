import type React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OrderManagementFlowHeader } from './OrderManagementFlowHeader'

const mockPush = jest.fn()
const mockUseStoreSelector = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockPush }),
    useParams: () => ({ shopType: 'shopify', shopName: 'my-store' }),
}))

jest.mock('settings/automate', () => ({
    useStoreSelector: (...args: unknown[]) => mockUseStoreSelector(...args),
}))

jest.mock('pages/common/components/SecondaryNavbar/SecondaryNavbar', () => {
    const ReactActual: typeof import('react') = jest.requireActual('react')

    type SecondaryLinkProps = {
        activeClassName?: string
        className?: string
    }

    return {
        SecondaryNavbar: ({ children }: { children?: React.ReactNode }) => (
            <nav aria-label="secondary">
                {ReactActual.Children.map(children, (child) =>
                    ReactActual.isValidElement<SecondaryLinkProps>(child)
                        ? ReactActual.cloneElement(child, {
                              activeClassName: 'active',
                              className: 'link',
                          })
                        : child,
                )}
            </nav>
        ),
    }
})

jest.mock('pages/common/components/StoreSelector/StoreSelector', () => ({
    StoreSelector: () => <div>StoreSelector</div>,
}))

jest.mock('models/integration/constants', () => ({
    IntegrationType: { Shopify: 'shopify' },
}))

const defaultProps = {
    title: 'Cancel Order',
}

beforeEach(() => {
    jest.clearAllMocks()
    mockUseStoreSelector.mockReturnValue({
        integrations: [],
        onChange: jest.fn(),
        selected: undefined,
    })
})

describe('OrderManagementFlowHeader', () => {
    describe('title rendering', () => {
        it('should render the title', () => {
            render(<OrderManagementFlowHeader {...defaultProps} />)

            expect(
                screen.getByRole('heading', { name: 'Cancel Order' }),
            ).toBeInTheDocument()
        })
    })

    describe('breadcrumbs rendering', () => {
        it('should render Order Management breadcrumb with link', () => {
            render(<OrderManagementFlowHeader {...defaultProps} />)

            expect(
                screen.getByRole('link', { name: 'Order Management' }),
            ).toHaveAttribute(
                'href',
                '/app/settings/order-management/shopify/my-store',
            )
        })

        it('should render the flow title as the last breadcrumb without a link', () => {
            render(<OrderManagementFlowHeader {...defaultProps} />)

            expect(
                screen.queryByRole('link', { name: 'Cancel Order' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('back button', () => {
        it('should render the back button', () => {
            render(<OrderManagementFlowHeader {...defaultProps} />)

            expect(
                screen.getByRole('button', { name: /go back/i }),
            ).toBeInTheDocument()
        })

        it('should navigate to order management base path when back button is clicked', async () => {
            const user = userEvent.setup()
            render(<OrderManagementFlowHeader {...defaultProps} />)

            await user.click(screen.getByRole('button', { name: /go back/i }))

            expect(mockPush).toHaveBeenCalledWith(
                '/app/settings/order-management/shopify/my-store',
            )
        })

        it('should navigate to backPath when provided', async () => {
            const user = userEvent.setup()
            render(
                <OrderManagementFlowHeader
                    {...defaultProps}
                    backPath="/app/settings/order-management/shopify/my-store/report-issue"
                />,
            )

            await user.click(screen.getByRole('button', { name: /go back/i }))

            expect(mockPush).toHaveBeenCalledWith(
                '/app/settings/order-management/shopify/my-store/report-issue',
            )
        })
    })

    describe('help link', () => {
        it('should render the help link', () => {
            render(<OrderManagementFlowHeader {...defaultProps} />)

            const link = screen.getByRole('link', {
                name: /learn more about order statuses/i,
            })
            expect(link).toHaveAttribute('target', '_blank')
            expect(link).toHaveAttribute('rel', 'noreferrer')
        })
    })

    describe('store selector', () => {
        it('should render the store selector', () => {
            render(<OrderManagementFlowHeader {...defaultProps} />)

            expect(screen.getByText('StoreSelector')).toBeInTheDocument()
        })
    })

    describe('save button', () => {
        it('should render save button when onSave is provided', () => {
            render(
                <OrderManagementFlowHeader
                    {...defaultProps}
                    onSave={jest.fn()}
                />,
            )

            expect(
                screen.getByRole('button', { name: /save/i }),
            ).toBeInTheDocument()
        })

        it('should call onSave when save button is clicked', async () => {
            const user = userEvent.setup()
            const onSave = jest.fn()
            render(
                <OrderManagementFlowHeader
                    {...defaultProps}
                    onSave={onSave}
                    isSaveDisabled={false}
                />,
            )

            await user.click(screen.getByRole('button', { name: /save/i }))

            expect(onSave).toHaveBeenCalledTimes(1)
        })

        it('should not render save button when onSave is not provided', () => {
            render(<OrderManagementFlowHeader {...defaultProps} />)

            expect(
                screen.queryByRole('button', { name: /save/i }),
            ).not.toBeInTheDocument()
        })

        it('should render save button as disabled by default', () => {
            render(
                <OrderManagementFlowHeader
                    {...defaultProps}
                    onSave={jest.fn()}
                />,
            )

            expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
        })
    })

    describe('secondary navigation', () => {
        it('should render Configuration and Channels nav links', () => {
            render(<OrderManagementFlowHeader {...defaultProps} />)

            const secondaryNav = screen.getByRole('navigation', {
                name: /secondary/i,
            })
            expect(secondaryNav).toHaveTextContent('Configuration')
            expect(secondaryNav).toHaveTextContent('Channels')
        })

        it('should build nav links pointing to the store base path', () => {
            render(<OrderManagementFlowHeader {...defaultProps} />)

            const links = screen
                .getByRole('navigation', { name: /secondary/i })
                .querySelectorAll('a')

            expect(links[0]).toHaveAttribute(
                'href',
                '/app/settings/order-management/shopify/my-store',
            )
            expect(links[1]).toHaveAttribute(
                'href',
                '/app/settings/order-management/shopify/my-store/channels',
            )
        })

        it('should highlight Configuration on order management flow routes', () => {
            render(<OrderManagementFlowHeader {...defaultProps} />, {
                initialEntries: [
                    '/app/settings/order-management/shopify/my-store/report-issue/0',
                ],
            })

            expect(
                screen.getByRole('link', { name: 'Configuration' }),
            ).toHaveClass('active')
            expect(
                screen.getByRole('link', { name: 'Channels' }),
            ).not.toHaveClass('active')
        })

        it('should not highlight Configuration on the Channels route', () => {
            render(<OrderManagementFlowHeader {...defaultProps} />, {
                initialEntries: [
                    '/app/settings/order-management/shopify/my-store/channels',
                ],
            })

            expect(
                screen.getByRole('link', { name: 'Configuration' }),
            ).not.toHaveClass('active')
            expect(screen.getByRole('link', { name: 'Channels' })).toHaveClass(
                'active',
            )
        })
    })
})
