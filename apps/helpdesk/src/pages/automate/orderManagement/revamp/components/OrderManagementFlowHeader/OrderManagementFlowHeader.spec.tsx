import type React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OrderManagementFlowHeader } from './OrderManagementFlowHeader'

const mockPush = jest.fn()
const mockUseStoreSelector = jest.fn()

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Breadcrumb: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
    ),
    Breadcrumbs: ({
        items,
        children,
    }: {
        items: Array<{ id: string; label: string; link?: string }>
        children: (item: {
            id: string
            label: string
            link?: string
        }) => React.ReactNode
    }) => (
        <nav>
            {items.map((item) => (
                <div key={item.id}>{children(item)}</div>
            ))}
        </nav>
    ),
    PageHeader: ({
        title,
        children,
    }: {
        title: React.ReactNode
        children?: React.ReactNode
    }) => (
        <div>
            {typeof title === 'string' ? <h1>{title}</h1> : title}
            {children}
        </div>
    ),
    Button: ({
        children,
        onClick,
        icon,
        'aria-label': ariaLabel,
        isDisabled,
    }: {
        children?: React.ReactNode
        onClick?: () => void
        icon?: string
        'aria-label'?: string
        isDisabled?: boolean
    }) => (
        <button
            onClick={onClick}
            data-icon={icon}
            aria-label={ariaLabel}
            disabled={isDisabled}
        >
            {children}
        </button>
    ),
    Heading: ({ children }: { children?: React.ReactNode }) => (
        <h1>{children}</h1>
    ),
    Text: ({ children }: { children?: React.ReactNode }) => (
        <span>{children}</span>
    ),
    Icon: ({ name }: { name: string }) => <span data-icon={name} />,
    TextSize: { Sm: 'sm' },
    TextVariant: { Medium: 'medium' },
    ButtonIntent: { Regular: 'regular' },
    ButtonVariant: { Primary: 'primary', Secondary: 'secondary' },
    ButtonSize: { Sm: 'sm', Md: 'md' },
    ButtonAs: { Button: 'button' },
    HeadingSize: { Xl: 'xl' },
    IconName: { ArrowLeft: 'arrow-left' },
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockPush }),
    useParams: () => ({ shopType: 'shopify', shopName: 'my-store' }),
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
        <a href={to}>{children}</a>
    ),
    NavLink: ({ children, to }: { children: React.ReactNode; to: string }) => (
        <a href={to}>{children}</a>
    ),
}))

jest.mock('settings/automate', () => ({
    useStoreSelector: (...args: unknown[]) => mockUseStoreSelector(...args),
}))

jest.mock(
    'pages/common/components/SecondaryNavbar/SecondaryNavbar',
    () =>
        ({ children }: { children?: React.ReactNode }) => (
            <nav aria-label="secondary">{children}</nav>
        ),
)

jest.mock('pages/common/components/StoreSelector/StoreSelector', () => () => (
    <div>StoreSelector</div>
))

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

            const link = screen.getByText('Order Management').closest('a')
            expect(link).toHaveAttribute(
                'href',
                '/app/settings/order-management/shopify/my-store',
            )
        })

        it('should render the flow title as the last breadcrumb without a link', () => {
            render(<OrderManagementFlowHeader {...defaultProps} />)

            const titleBreadcrumb = screen
                .getAllByText('Cancel Order')
                .find((el) => el.closest('nav'))
            expect(titleBreadcrumb?.closest('a')).toBeNull()
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

            const link = screen
                .getByText(/learn more about order statuses/i)
                .closest('a')
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
    })
})
