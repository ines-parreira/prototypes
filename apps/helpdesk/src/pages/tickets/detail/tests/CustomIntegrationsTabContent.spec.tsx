import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    CUSTOM_WIDGET_TYPE,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
} from 'state/widgets/constants'
import { WidgetEnvironment } from 'state/widgets/types'

import CustomIntegrationsTabContent from '../CustomIntegrationsTabContent'

const mockStore = configureMockStore([thunk])

jest.mock('../WidgetEditionTools', () => ({
    __esModule: true,
    default: () => <div>WidgetEditionTools</div>,
}))

jest.mock('Widgets/contexts/WidgetContext', () => ({
    WidgetContextProvider: ({ children }: any) => <>{children}</>,
}))

jest.mock('Widgets/modules/Template', () => ({
    __esModule: true,
    default: ({ source, template }: any) => (
        <div>
            MockTemplate source={JSON.stringify(source)} templatePath=
            {template.templatePath}
        </div>
    ),
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

function buildWidget(type: string, overrides: Record<string, unknown> = {}) {
    return {
        id: Math.random(),
        type,
        context: WidgetEnvironment.Ticket,
        template: { fields: [] },
        ...overrides,
    }
}

const store = mockStore({})

function renderWithProviders(ui: React.ReactElement) {
    return render(<Provider store={store}>{ui}</Provider>)
}

describe('CustomIntegrationsTabContent', () => {
    it('should return null when no custom widgets exist', () => {
        const widgets = buildWidgets({
            items: [buildWidget('shopify')],
        })
        const sources = fromJS({ ticket: { customer: {} } })

        const { container } = renderWithProviders(
            <CustomIntegrationsTabContent
                sources={sources}
                widgets={widgets}
                customerId={null}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render a custom widget when source data exists', () => {
        const widgets = buildWidgets({
            items: [buildWidget(CUSTOM_WIDGET_TYPE, { id: 1 })],
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    data: { someField: 'value' },
                },
            },
        })

        renderWithProviders(
            <CustomIntegrationsTabContent
                sources={sources}
                widgets={widgets}
                customerId={null}
            />,
        )

        expect(screen.getByText(/MockTemplate/)).toBeInTheDocument()
    })

    it('should render a external_data widget when source and app_id exist', () => {
        const widgets = buildWidgets({
            items: [
                buildWidget(CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE, {
                    id: 2,
                    app_id: 'my-app',
                }),
            ],
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    external_data: {
                        'my-app': { name: 'Test' },
                    },
                },
            },
        })

        renderWithProviders(
            <CustomIntegrationsTabContent
                sources={sources}
                widgets={widgets}
                customerId={null}
            />,
        )

        expect(screen.getByText(/MockTemplate/)).toBeInTheDocument()
    })

    it('should not render external_data widget when app_id is missing', () => {
        const widgets = buildWidgets({
            items: [
                buildWidget(CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE, {
                    id: 3,
                }),
            ],
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    external_data: {},
                },
            },
        })

        renderWithProviders(
            <CustomIntegrationsTabContent
                sources={sources}
                widgets={widgets}
                customerId={null}
            />,
        )

        expect(screen.queryByText(/MockTemplate/)).not.toBeInTheDocument()
    })

    it('should render a standalone widget', () => {
        const widgets = buildWidgets({
            items: [buildWidget(STANDALONE_WIDGET_TYPE, { id: 4 })],
        })
        const sources = fromJS({ ticket: { customer: {} } })

        renderWithProviders(
            <CustomIntegrationsTabContent
                sources={sources}
                widgets={widgets}
                customerId={null}
            />,
        )

        expect(screen.getByText(/MockTemplate/)).toBeInTheDocument()
    })

    it('should render multiple custom widgets stacked', () => {
        const widgets = buildWidgets({
            items: [
                buildWidget(CUSTOM_WIDGET_TYPE, { id: 10 }),
                buildWidget(STANDALONE_WIDGET_TYPE, { id: 11 }),
            ],
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    data: { someField: 'value' },
                },
            },
        })

        renderWithProviders(
            <CustomIntegrationsTabContent
                sources={sources}
                widgets={widgets}
                customerId={null}
            />,
        )

        expect(screen.getAllByText(/MockTemplate/)).toHaveLength(2)
    })

    it('should show WidgetEditionTools when isEditing is true', () => {
        const items = [buildWidget(STANDALONE_WIDGET_TYPE, { id: 5 })]
        const widgets = buildWidgets({
            isEditing: true,
            items,
            editedItems: items,
        })
        const sources = fromJS({ ticket: { customer: {} } })

        renderWithProviders(
            <CustomIntegrationsTabContent
                sources={sources}
                widgets={widgets}
                customerId={null}
            />,
        )

        expect(screen.getByText('WidgetEditionTools')).toBeInTheDocument()
    })

    it('should hide edition tools when not editing', () => {
        const widgets = buildWidgets({
            isEditing: false,
            items: [buildWidget(STANDALONE_WIDGET_TYPE, { id: 6 })],
        })
        const sources = fromJS({ ticket: { customer: {} } })

        renderWithProviders(
            <CustomIntegrationsTabContent
                sources={sources}
                widgets={widgets}
                customerId={null}
            />,
        )

        expect(screen.queryByText('WidgetEditionTools')).not.toBeInTheDocument()
    })

    it('should filter out named integration widget types', () => {
        const widgets = buildWidgets({
            items: [
                buildWidget('shopify', { id: 20 }),
                buildWidget('recharge', { id: 21 }),
                buildWidget(CUSTOM_WIDGET_TYPE, { id: 22 }),
            ],
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    data: { someField: 'value' },
                },
            },
        })

        renderWithProviders(
            <CustomIntegrationsTabContent
                sources={sources}
                widgets={widgets}
                customerId={null}
            />,
        )

        expect(screen.getAllByText(/MockTemplate/)).toHaveLength(1)
    })

    it('should render an integration-based widget when source data exists', () => {
        const widgets = buildWidgets({
            items: [buildWidget('http', { id: 30, integration_id: 100 })],
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    integrations: {
                        '100': { someField: 'value' },
                    },
                },
            },
        })

        renderWithProviders(
            <CustomIntegrationsTabContent
                sources={sources}
                widgets={widgets}
                customerId={null}
            />,
        )

        expect(screen.getByText(/MockTemplate/)).toBeInTheDocument()
    })

    it('should not render an integration-based widget when source data is missing', () => {
        const widgets = buildWidgets({
            items: [buildWidget('http', { id: 31, integration_id: 100 })],
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    integrations: {},
                },
            },
        })

        renderWithProviders(
            <CustomIntegrationsTabContent
                sources={sources}
                widgets={widgets}
                customerId={null}
            />,
        )

        expect(screen.queryByText(/MockTemplate/)).not.toBeInTheDocument()
    })

    it('should not render a non-standalone widget when source data is missing at the path', () => {
        const widgets = buildWidgets({
            items: [buildWidget(CUSTOM_WIDGET_TYPE, { id: 50 })],
        })
        const sources = fromJS({
            ticket: {
                customer: {},
            },
        })

        renderWithProviders(
            <CustomIntegrationsTabContent
                sources={sources}
                widgets={widgets}
                customerId={null}
            />,
        )

        expect(screen.queryByText(/MockTemplate/)).not.toBeInTheDocument()
    })

    it('should not render external_data widget when app_id exists but source has no matching entry', () => {
        const widgets = buildWidgets({
            items: [
                buildWidget(CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE, {
                    id: 51,
                    app_id: 'my-app',
                }),
            ],
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    external_data: {},
                },
            },
        })

        renderWithProviders(
            <CustomIntegrationsTabContent
                sources={sources}
                widgets={widgets}
                customerId={null}
            />,
        )

        expect(screen.queryByText(/MockTemplate/)).not.toBeInTheDocument()
    })

    it('should not render an integration-based widget when integration_id is missing', () => {
        const widgets = buildWidgets({
            items: [buildWidget('http', { id: 52 })],
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    integrations: {
                        '100': { someField: 'value' },
                    },
                },
            },
        })

        renderWithProviders(
            <CustomIntegrationsTabContent
                sources={sources}
                widgets={widgets}
                customerId={null}
            />,
        )

        expect(screen.queryByText(/MockTemplate/)).not.toBeInTheDocument()
    })

    it('should render klaviyo widget alongside other custom types', () => {
        const widgets = buildWidgets({
            items: [
                buildWidget('klaviyo', { id: 40, integration_id: 200 }),
                buildWidget(STANDALONE_WIDGET_TYPE, { id: 41 }),
            ],
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    integrations: {
                        '200': { someField: 'value' },
                    },
                },
            },
        })

        renderWithProviders(
            <CustomIntegrationsTabContent
                sources={sources}
                widgets={widgets}
                customerId={null}
            />,
        )

        expect(screen.getAllByText(/MockTemplate/)).toHaveLength(2)
    })
})
