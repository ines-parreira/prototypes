import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { IntegrationType } from '@gorgias/helpdesk-queries'

import { WidgetEnvironment } from 'state/widgets/types'

import RechargeTabContent from '../RechargeTabContent'

jest.mock('Widgets/modules/Recharge', () => ({
    __esModule: true,
    default: ({ source, template }: any) => (
        <div>
            RechargeWidget source={JSON.stringify(source)} templatePath=
            {template.templatePath}
        </div>
    ),
}))

jest.mock('../RechargeWidgetsEditionTools', () => ({
    __esModule: true,
    default: () => <div>RechargeWidgetsEditionTools</div>,
}))

jest.mock('Widgets/contexts/WidgetContext', () => ({
    WidgetContextProvider: ({ children }: any) => <>{children}</>,
}))

const rechargeIntegration = { id: 123 }

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
    integrationId: number,
    data: Record<string, unknown> = { subscriptions: [] },
) {
    return fromJS({
        ticket: {
            customer: {
                integrations: {
                    [String(integrationId)]: data,
                },
            },
        },
    })
}

function buildRechargeWidget(overrides: Record<string, unknown> = {}) {
    return {
        id: 1,
        type: IntegrationType.Recharge,
        context: WidgetEnvironment.Ticket,
        template: { fields: [] },
        ...overrides,
    }
}

describe('RechargeTabContent', () => {
    it('should return null when no Recharge widget exists in items', () => {
        const widgets = buildWidgets({
            items: [
                {
                    id: 1,
                    type: IntegrationType.Shopify,
                    context: WidgetEnvironment.Ticket,
                    template: {},
                },
            ],
        })
        const sources = buildSources(123)

        const { container } = render(
            <RechargeTabContent
                sources={sources}
                widgets={widgets}
                rechargeIntegration={rechargeIntegration}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should return null when source data is missing for integration', () => {
        const widgets = buildWidgets({
            items: [buildRechargeWidget()],
        })
        const sources = fromJS({
            ticket: {
                customer: {
                    integrations: {},
                },
            },
        })

        const { container } = render(
            <RechargeTabContent
                sources={sources}
                widgets={widgets}
                rechargeIntegration={rechargeIntegration}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render RechargeWidget when widget and source exist', () => {
        const widgets = buildWidgets({
            items: [buildRechargeWidget()],
        })
        const sources = buildSources(123)

        render(
            <RechargeTabContent
                sources={sources}
                widgets={widgets}
                rechargeIntegration={rechargeIntegration}
            />,
        )

        expect(screen.getByText(/RechargeWidget/)).toBeInTheDocument()
    })

    it('should show RechargeWidgetsEditionTools when isEditing is true', () => {
        const widgets = buildWidgets({
            isEditing: true,
            items: [buildRechargeWidget()],
            editedItems: [buildRechargeWidget()],
        })
        const sources = buildSources(123)

        render(
            <RechargeTabContent
                sources={sources}
                widgets={widgets}
                rechargeIntegration={rechargeIntegration}
            />,
        )

        expect(
            screen.getByText('RechargeWidgetsEditionTools'),
        ).toBeInTheDocument()
    })

    it('should hide edition tools when not editing', () => {
        const widgets = buildWidgets({
            isEditing: false,
            items: [buildRechargeWidget()],
        })
        const sources = buildSources(123)

        render(
            <RechargeTabContent
                sources={sources}
                widgets={widgets}
                rechargeIntegration={rechargeIntegration}
            />,
        )

        expect(
            screen.queryByText('RechargeWidgetsEditionTools'),
        ).not.toBeInTheDocument()
    })
})
