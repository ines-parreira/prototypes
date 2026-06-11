import { useMemo } from 'react'

import { fromJS } from 'immutable'
import type { List, Map } from 'immutable'

import { useAppSelector } from 'hooks/useAppSelector'
import type { Source, Template } from 'models/widget/types'
import { canDisplayWidget } from 'pages/common/components/infobar/utils'
import { WOOCOMMERCE_WIDGET_TYPE } from 'state/widgets/constants'
import {
    getSourcesWithCustomer,
    getWidgetsState,
} from 'state/widgets/selectors'
import { WidgetEnvironment } from 'state/widgets/types'
import { itemsWithContext } from 'state/widgets/utils'

export function useIsWooCommerceDisplayable() {
    const widgets = useAppSelector(getWidgetsState)
    const sources = useAppSelector(getSourcesWithCustomer)

    return useMemo(() => {
        const ecommerceData = sources.getIn([
            'ticket',
            'customer',
            'ecommerce_data',
        ]) as Map<string, Map<string, unknown>> | undefined
        if (!ecommerceData) return false

        const items = widgets.get('items', fromJS([])) as List<
            Map<string, unknown>
        >
        const wooWidgets = itemsWithContext(
            items,
            WidgetEnvironment.Ticket,
        )?.filter((w) => w?.get('type') === WOOCOMMERCE_WIDGET_TYPE)
        if (!wooWidgets || wooWidgets.isEmpty()) return false

        return wooWidgets.some((widget) => {
            const integrationId = widget.get('integration_id')
            const entry = ecommerceData.findEntry(
                (value) =>
                    value?.getIn?.(['store', 'helpdesk_integration_id']) ===
                    integrationId,
            )
            if (!entry) return false
            const [, storeData] = entry
            const template = (
                widget.get('template') as Map<string, unknown>
            ).toJS() as Template
            return canDisplayWidget(
                template,
                storeData,
                storeData.toJS() as Source,
            )
        })
    }, [widgets, sources])
}
