import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { IntegrationType } from '@gorgias/helpdesk-queries'

import { WidgetEnvironment } from 'state/widgets/types'

import IntegrationTabContent from '../IntegrationTabContent'

const MockWidget = ({ source, template }: any) => (
    <div>
        MockWidget source={JSON.stringify(source)} templatePath=
        {template.templatePath}
    </div>
)

jest.mock('../WidgetEditionTools', () => ({
    __esModule: true,
    default: () => <div>WidgetEditionTools</div>,
}))

jest.mock('Widgets/contexts/WidgetContext', () => ({
    WidgetContextProvider: ({ children }: any) => <>{children}</>,
}))

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

function buildSources(
    path: string[],
    data: Record<string, unknown> = { subscriptions: [] },
) {
    let sources: Record<string, any> = {}
    let current = sources
    for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = {}
        current = current[path[i]]
    }
    current[path[path.length - 1]] = data
    return fromJS(sources)
}

function buildWidget(type: string, overrides: Record<string, unknown> = {}) {
    return {
        id: 1,
        type,
        context: WidgetEnvironment.Ticket,
        template: { fields: [] },
        ...overrides,
    }
}

describe('IntegrationTabContent', () => {
    const defaultSourcePath = ['ticket', 'customer', 'integrations', '123']

    it('should return null when no matching widget exists in items', () => {
        const widgets = buildWidgets({
            items: [buildWidget(IntegrationType.Shopify)],
        })
        const sources = buildSources(defaultSourcePath)

        const { container } = render(
            <IntegrationTabContent
                sources={sources}
                widgets={widgets}
                widgetType={IntegrationType.Recharge}
                sourcePath={defaultSourcePath}
                WidgetComponent={MockWidget}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should return null when source data is missing', () => {
        const widgets = buildWidgets({
            items: [buildWidget(IntegrationType.Recharge)],
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    integrations: {},
                },
            },
        })

        const { container } = render(
            <IntegrationTabContent
                sources={sources}
                widgets={widgets}
                widgetType={IntegrationType.Recharge}
                sourcePath={defaultSourcePath}
                WidgetComponent={MockWidget}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render widget when widget and source exist', () => {
        const widgets = buildWidgets({
            items: [buildWidget(IntegrationType.Recharge)],
        })
        const sources = buildSources(defaultSourcePath)

        render(
            <IntegrationTabContent
                sources={sources}
                widgets={widgets}
                widgetType={IntegrationType.Recharge}
                sourcePath={defaultSourcePath}
                WidgetComponent={MockWidget}
            />,
        )

        expect(screen.getByText(/MockWidget/)).toBeInTheDocument()
    })

    it('should show WidgetEditionTools when isEditing is true', () => {
        const widgets = buildWidgets({
            isEditing: true,
            items: [buildWidget(IntegrationType.Recharge)],
            editedItems: [buildWidget(IntegrationType.Recharge)],
        })
        const sources = buildSources(defaultSourcePath)

        render(
            <IntegrationTabContent
                sources={sources}
                widgets={widgets}
                widgetType={IntegrationType.Recharge}
                sourcePath={defaultSourcePath}
                WidgetComponent={MockWidget}
            />,
        )

        expect(screen.getByText('WidgetEditionTools')).toBeInTheDocument()
    })

    it('should hide edition tools when not editing', () => {
        const widgets = buildWidgets({
            isEditing: false,
            items: [buildWidget(IntegrationType.Recharge)],
        })
        const sources = buildSources(defaultSourcePath)

        render(
            <IntegrationTabContent
                sources={sources}
                widgets={widgets}
                widgetType={IntegrationType.Recharge}
                sourcePath={defaultSourcePath}
                WidgetComponent={MockWidget}
            />,
        )

        expect(screen.queryByText('WidgetEditionTools')).not.toBeInTheDocument()
    })

    it('should work with BigCommerce widget type', () => {
        const sourcePath = ['ticket', 'customer', 'integrations', '456']
        const widgets = buildWidgets({
            items: [buildWidget(IntegrationType.Bigcommerce)],
        })
        const sources = buildSources(sourcePath)

        render(
            <IntegrationTabContent
                sources={sources}
                widgets={widgets}
                widgetType={IntegrationType.Bigcommerce}
                sourcePath={sourcePath}
                WidgetComponent={MockWidget}
            />,
        )

        expect(screen.getByText(/MockWidget/)).toBeInTheDocument()
    })

    it('should work with WooCommerce widget type and ecommerce_data path', () => {
        const sourcePath = [
            'ticket',
            'customer',
            'ecommerce_data',
            'store-uuid',
        ]
        const widgets = buildWidgets({
            items: [buildWidget('woocommerce')],
        })
        const sources = buildSources(sourcePath, {
            store: { type: 'woocommerce' },
        })

        render(
            <IntegrationTabContent
                sources={sources}
                widgets={widgets}
                widgetType="woocommerce"
                sourcePath={sourcePath}
                WidgetComponent={MockWidget}
            />,
        )

        expect(screen.getByText(/MockWidget/)).toBeInTheDocument()
    })
})
