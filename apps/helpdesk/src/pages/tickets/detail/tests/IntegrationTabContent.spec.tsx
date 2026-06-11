import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { IntegrationType } from '@gorgias/helpdesk-types'

import { WidgetEnvironment } from 'state/widgets/types'

import { IntegrationTabContent } from '../IntegrationTabContent'

const MockWidget = ({ source, template }: any) => (
    <div>
        MockWidget source={JSON.stringify(source)} templatePath=
        {template.templatePath}
    </div>
)

jest.mock('../WidgetEditionTools', () => ({
    __esModule: true,
    WidgetEditionTools: () => <div>WidgetEditionTools</div>,
}))

jest.mock('Widgets/contexts/WidgetContext', () => ({
    WidgetContextProvider: ({ children }: any) => <>{children}</>,
}))

const defaultTemplate = {
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

function buildSources(
    path: string[],
    data: Record<string, unknown> = { customer: { email: 'a@b.com' } },
) {
    const sources: Record<string, any> = {}
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
        template: defaultTemplate,
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
                sourcePaths={[defaultSourcePath]}
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
                sourcePaths={[defaultSourcePath]}
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
                sourcePaths={[defaultSourcePath]}
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
                sourcePaths={[defaultSourcePath]}
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
                sourcePaths={[defaultSourcePath]}
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
                sourcePaths={[sourcePath]}
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
            customer: { email: 'woo@example.com' },
        })

        render(
            <IntegrationTabContent
                sources={sources}
                widgets={widgets}
                widgetType="woocommerce"
                sourcePaths={[sourcePath]}
                WidgetComponent={MockWidget}
            />,
        )

        expect(screen.getByText(/MockWidget/)).toBeInTheDocument()
    })

    it('should render all displayable integrations in view mode', () => {
        const path1 = ['ticket', 'customer', 'integrations', '111']
        const path2 = ['ticket', 'customer', 'integrations', '222']
        const widgets = buildWidgets({
            items: [buildWidget(IntegrationType.Smile)],
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    integrations: {
                        '111': { customer: { email: 'one@example.com' } },
                        '222': { customer: { email: 'two@example.com' } },
                    },
                },
            },
        })

        render(
            <IntegrationTabContent
                sources={sources}
                widgets={widgets}
                widgetType={IntegrationType.Smile}
                sourcePaths={[path1, path2]}
                WidgetComponent={MockWidget}
            />,
        )

        expect(screen.getAllByText(/MockWidget/)).toHaveLength(2)
    })

    it('should render only the first displayable integration in edit mode', () => {
        const path1 = ['ticket', 'customer', 'integrations', '111']
        const path2 = ['ticket', 'customer', 'integrations', '222']
        const smileWidget = buildWidget(IntegrationType.Smile)
        const widgets = buildWidgets({
            isEditing: true,
            items: [smileWidget],
            editedItems: [smileWidget],
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    integrations: {
                        '111': { customer: { email: 'one@example.com' } },
                        '222': { customer: { email: 'two@example.com' } },
                    },
                },
            },
        })

        render(
            <IntegrationTabContent
                sources={sources}
                widgets={widgets}
                widgetType={IntegrationType.Smile}
                sourcePaths={[path1, path2]}
                WidgetComponent={MockWidget}
            />,
        )

        expect(screen.getAllByText(/MockWidget/)).toHaveLength(1)
        expect(screen.getByText(/one@example.com/)).toBeInTheDocument()
    })

    it('should drop source paths whose data is empty per canDisplayWidget', () => {
        const path1 = ['ticket', 'customer', 'integrations', '111']
        const path2 = ['ticket', 'customer', 'integrations', '222']
        const widgets = buildWidgets({
            items: [buildWidget(IntegrationType.Smile)],
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    integrations: {
                        '111': { customer: {} },
                        '222': { customer: { email: 'two@example.com' } },
                    },
                },
            },
        })

        render(
            <IntegrationTabContent
                sources={sources}
                widgets={widgets}
                widgetType={IntegrationType.Smile}
                sourcePaths={[path1, path2]}
                WidgetComponent={MockWidget}
            />,
        )

        expect(screen.getAllByText(/MockWidget/)).toHaveLength(1)
    })

    it('should return null when every source path is empty per canDisplayWidget', () => {
        const path1 = ['ticket', 'customer', 'integrations', '111']
        const path2 = ['ticket', 'customer', 'integrations', '222']
        const widgets = buildWidgets({
            items: [buildWidget(IntegrationType.Smile)],
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    integrations: {
                        '111': { customer: {} },
                        '222': { customer: {} },
                    },
                },
            },
        })

        const { container } = render(
            <IntegrationTabContent
                sources={sources}
                widgets={widgets}
                widgetType={IntegrationType.Smile}
                sourcePaths={[path1, path2]}
                WidgetComponent={MockWidget}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should skip source paths with no data and render remaining widgets', () => {
        const path1 = ['ticket', 'customer', 'integrations', '111']
        const path2 = ['ticket', 'customer', 'integrations', '222']
        const widgets = buildWidgets({
            items: [buildWidget(IntegrationType.Smile)],
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    integrations: {
                        '111': { customer: { email: 'one@example.com' } },
                    },
                },
            },
        })

        render(
            <IntegrationTabContent
                sources={sources}
                widgets={widgets}
                widgetType={IntegrationType.Smile}
                sourcePaths={[path1, path2]}
                WidgetComponent={MockWidget}
            />,
        )

        expect(screen.getAllByText(/MockWidget/)).toHaveLength(1)
    })
})
