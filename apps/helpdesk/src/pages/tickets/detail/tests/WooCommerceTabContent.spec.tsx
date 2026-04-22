import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { WOOCOMMERCE_WIDGET_TYPE } from 'state/widgets/constants'
import { WidgetEnvironment } from 'state/widgets/types'

import WooCommerceTabContent from '../WooCommerceTabContent'

jest.mock('../WidgetEditionTools', () => ({
    __esModule: true,
    default: () => <div>WidgetEditionTools</div>,
}))

jest.mock('Widgets/contexts/WidgetContext', () => ({
    WidgetContextProvider: ({ children }: any) => <>{children}</>,
}))

jest.mock('Widgets/modules/WooCommerce', () => ({
    __esModule: true,
    default: ({ source, template }: any) => (
        <div>
            WooMock source={JSON.stringify(source)} templatePath=
            {template.templatePath}
        </div>
    ),
}))

const wooTemplate = {
    type: 'wrapper',
    widgets: [
        {
            type: 'card',
            path: 'customer',
            widgets: [
                {
                    type: 'text',
                    path: 'email',
                    title: 'Email',
                },
            ],
        },
    ],
}

function buildWidgets({
    isEditing = false,
    items = [] as any[],
    editedItems,
}: {
    isEditing?: boolean
    items?: any[]
    editedItems?: any[]
} = {}) {
    return fromJS({
        items,
        _internal: {
            isEditing,
            editedItems: editedItems ?? items,
        },
    })
}

function buildWooWidget(
    id: number,
    integrationId: number,
    overrides: Record<string, unknown> = {},
) {
    return {
        id,
        type: WOOCOMMERCE_WIDGET_TYPE,
        context: WidgetEnvironment.Ticket,
        integration_id: integrationId,
        template: wooTemplate,
        ...overrides,
    }
}

function buildSources(ecommerceData: Record<string, unknown> | null): any {
    return fromJS({
        ticket: {
            customer: ecommerceData ? { ecommerce_data: ecommerceData } : {},
        },
    })
}

describe('WooCommerceTabContent', () => {
    it('should return null when ecommerce_data is missing', () => {
        const widgets = buildWidgets({ items: [buildWooWidget(1, 1)] })
        const sources = buildSources(null)

        const { container } = render(
            <WooCommerceTabContent sources={sources} widgets={widgets} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should return null when no ticket-context woocommerce widget exists', () => {
        const widgets = buildWidgets({
            items: [buildWooWidget(1, 1, { context: WidgetEnvironment.User })],
        })
        const sources = buildSources({
            'store-uuid': {
                store: { type: 'woocommerce', helpdesk_integration_id: 1 },
                customer: { email: 'woo@example.com' },
            },
        })

        const { container } = render(
            <WooCommerceTabContent sources={sources} widgets={widgets} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should return null when all widget-to-store pairs fail canDisplayWidget', () => {
        const widgets = buildWidgets({ items: [buildWooWidget(1, 1)] })
        const sources = buildSources({
            'store-uuid': {
                store: { type: 'woocommerce', helpdesk_integration_id: 1 },
                customer: {},
            },
        })

        const { container } = render(
            <WooCommerceTabContent sources={sources} widgets={widgets} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render one card per matched widget-store pair with displayable data', () => {
        const widgets = buildWidgets({
            items: [buildWooWidget(10, 1), buildWooWidget(11, 2)],
        })
        const sources = buildSources({
            'store-a': {
                store: { type: 'woocommerce', helpdesk_integration_id: 1 },
                customer: { email: 'first@example.com' },
            },
            'store-b': {
                store: { type: 'woocommerce', helpdesk_integration_id: 2 },
                customer: { email: 'second@example.com' },
            },
        })

        render(<WooCommerceTabContent sources={sources} widgets={widgets} />)

        expect(screen.getAllByText(/WooMock/)).toHaveLength(2)
        expect(screen.getByText(/templatePath=0\.template/)).toBeInTheDocument()
        expect(screen.getByText(/templatePath=1\.template/)).toBeInTheDocument()
    })

    it('should skip orphan widgets (no matching store)', () => {
        const widgets = buildWidgets({
            items: [buildWooWidget(10, 1), buildWooWidget(11, 999)],
        })
        const sources = buildSources({
            'store-a': {
                store: { type: 'woocommerce', helpdesk_integration_id: 1 },
                customer: { email: 'first@example.com' },
            },
        })

        render(<WooCommerceTabContent sources={sources} widgets={widgets} />)

        expect(screen.getAllByText(/WooMock/)).toHaveLength(1)
    })

    it('should skip orphan stores (no matching widget)', () => {
        const widgets = buildWidgets({ items: [buildWooWidget(10, 1)] })
        const sources = buildSources({
            'store-a': {
                store: { type: 'woocommerce', helpdesk_integration_id: 1 },
                customer: { email: 'first@example.com' },
            },
            'store-orphan': {
                store: { type: 'woocommerce', helpdesk_integration_id: 999 },
                customer: { email: 'orphan@example.com' },
            },
        })

        render(<WooCommerceTabContent sources={sources} widgets={widgets} />)

        expect(screen.getAllByText(/WooMock/)).toHaveLength(1)
    })

    it('should show WidgetEditionTools when isEditing is true', () => {
        const widgets = buildWidgets({
            isEditing: true,
            items: [buildWooWidget(10, 1)],
            editedItems: [buildWooWidget(10, 1)],
        })
        const sources = buildSources({
            'store-a': {
                store: { type: 'woocommerce', helpdesk_integration_id: 1 },
                customer: { email: 'first@example.com' },
            },
        })

        render(<WooCommerceTabContent sources={sources} widgets={widgets} />)

        expect(screen.getByText('WidgetEditionTools')).toBeInTheDocument()
    })

    it('should hide WidgetEditionTools when not editing', () => {
        const widgets = buildWidgets({ items: [buildWooWidget(10, 1)] })
        const sources = buildSources({
            'store-a': {
                store: { type: 'woocommerce', helpdesk_integration_id: 1 },
                customer: { email: 'first@example.com' },
            },
        })

        render(<WooCommerceTabContent sources={sources} widgets={widgets} />)

        expect(screen.queryByText('WidgetEditionTools')).not.toBeInTheDocument()
    })
})
