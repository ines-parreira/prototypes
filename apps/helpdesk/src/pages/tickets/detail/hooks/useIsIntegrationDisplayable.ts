import { useMemo } from 'react'

import { fromJS } from 'immutable'
import type { List, Map } from 'immutable'

import type { IntegrationType } from '@gorgias/helpdesk-types'

import { useAppSelector } from 'hooks/useAppSelector'
import type { Source, Template } from 'models/widget/types'
import { canDisplayWidget } from 'pages/common/components/infobar/utils'
import { getIntegrationsByType } from 'state/integrations/selectors'
import { getIntegrationsData } from 'state/ticket/selectors'
import {
    getSourcesWithCustomer,
    getWidgetsState,
} from 'state/widgets/selectors'
import { WidgetEnvironment } from 'state/widgets/types'
import { itemsWithContext } from 'state/widgets/utils'

export function useIsIntegrationDisplayable(type: IntegrationType) {
    const customerIntegrations = useAppSelector(getIntegrationsData)
    const integrations = useAppSelector(getIntegrationsByType(type))
    const widgets = useAppSelector(getWidgetsState)
    const sources = useAppSelector(getSourcesWithCustomer)

    return useMemo(() => {
        const matched = integrations.filter((integration) =>
            customerIntegrations.has(String(integration.id)),
        )
        if (matched.length === 0) return false

        const items = widgets.get('items', fromJS([])) as List<
            Map<string, unknown>
        >
        const widget = itemsWithContext(items, WidgetEnvironment.Ticket)?.find(
            (w) => w?.get('type') === type,
        )
        if (!widget) return false

        const template = (
            widget.get('template') as Map<string, unknown>
        ).toJS() as Template

        return matched.some((integration) => {
            const source = sources.getIn([
                'ticket',
                'customer',
                'integrations',
                String(integration.id),
            ]) as Map<string, unknown> | undefined
            if (!source) return false
            return canDisplayWidget(template, source, source.toJS() as Source)
        })
    }, [customerIntegrations, integrations, widgets, sources, type])
}
