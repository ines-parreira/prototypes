import { useMemo } from 'react'

import { fromJS } from 'immutable'
import type { List, Map } from 'immutable'

import type { Source, Template } from 'models/widget/types'
import { canDisplayWidget } from 'pages/common/components/infobar/utils'
import { EditionContext } from 'providers/infobar/EditionContext'
import { WOOCOMMERCE_WIDGET_TYPE } from 'state/widgets/constants'
import type { WidgetsState } from 'state/widgets/types'
import { WidgetEnvironment } from 'state/widgets/types'
import { itemsWithContext } from 'state/widgets/utils'

import WidgetEditionTools from './WidgetEditionTools'
import WooCommerceStoreWidget from './WooCommerceStoreWidget'
import type { WooCommercePair } from './WooCommerceStoreWidget'

import css from './TicketInfobarContainer.less'

type Props = {
    sources: Map<string, unknown>
    widgets: WidgetsState
}

export default function WooCommerceTabContent({ sources, widgets }: Props) {
    const isEditing = useMemo(
        () => widgets.getIn(['_internal', 'isEditing']) as boolean,
        [widgets],
    )

    const items = useMemo(() => {
        return isEditing
            ? (widgets.getIn(['_internal', 'editedItems']) as List<
                  Map<string, unknown>
              >)
            : itemsWithContext(
                  widgets.get('items', fromJS([])) as List<
                      Map<string, unknown>
                  >,
                  WidgetEnvironment.Ticket,
              )
    }, [widgets, isEditing])

    const ecommerceData = useMemo(
        () =>
            sources.getIn(['ticket', 'customer', 'ecommerce_data']) as
                | Map<string, Map<string, unknown>>
                | undefined,
        [sources],
    )

    const pairs = useMemo<WooCommercePair[]>(() => {
        if (!ecommerceData || !items) return []
        const wooWidgets = items.filter(
            (w) => w?.get('type') === WOOCOMMERCE_WIDGET_TYPE,
        )
        if (wooWidgets.isEmpty()) return []

        const result: WooCommercePair[] = []

        wooWidgets.forEach((widget) => {
            const integrationId = widget.get('integration_id')
            const entry = ecommerceData.findEntry(
                (value) =>
                    value?.getIn?.(['store', 'helpdesk_integration_id']) ===
                    integrationId,
            )
            if (!entry) return
            const [storeUuid, storeData] = entry
            const template = (
                widget.get('template') as Map<string, unknown>
            ).toJS() as Template
            if (
                !canDisplayWidget(
                    template,
                    storeData,
                    storeData.toJS() as Source,
                )
            ) {
                return
            }
            const widgetIndex = items.findIndex(
                (w) => w?.get('id') === widget.get('id'),
            )
            result.push({
                widget,
                widgetIndex,
                storeUuid: storeUuid as string,
                source: storeData,
                template,
            })
        })

        return result
    }, [items, ecommerceData])

    if (pairs.length === 0) {
        return null
    }

    return (
        <div className={css.integrationContainer}>
            <EditionContext.Provider value={{ isEditing }}>
                <div className={css.integrationContent}>
                    {pairs.map((pair) => (
                        <WooCommerceStoreWidget
                            key={pair.storeUuid}
                            {...pair}
                        />
                    ))}
                </div>
                {isEditing && (
                    <WidgetEditionTools
                        widgets={widgets}
                        context={WidgetEnvironment.Ticket}
                    />
                )}
            </EditionContext.Provider>
        </div>
    )
}
