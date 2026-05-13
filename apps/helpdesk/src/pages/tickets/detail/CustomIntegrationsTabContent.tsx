import { useMemo } from 'react'

import { fromJS } from 'immutable'
import type { List, Map } from 'immutable'

import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'
import { useWidgetData } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/helpers'
import { EditionContext } from 'providers/infobar/EditionContext'
import { NAMED_INTEGRATION_WIDGET_TYPES } from 'state/widgets/constants'
import type { WidgetsState } from 'state/widgets/types'
import { WidgetEnvironment } from 'state/widgets/types'
import { getSourcePathFromContext, itemsWithContext } from 'state/widgets/utils'

import {
    getWidgetId,
    getWidgetType,
    toWidgetArray,
} from './customIntegrationsUtils'
import CustomWidgetItem from './CustomWidgetItem'
import WidgetEditionTools from './WidgetEditionTools'

import css from './TicketInfobarContainer.less'

type Props = {
    sources: Map<string, unknown>
    widgets: WidgetsState
    customerId: number | null
}

const NAMED_WIDGET_PLACEHOLDER_FILTER = '.named-widget-placeholder'

export default function CustomIntegrationsTabContent({
    sources,
    widgets,
    customerId,
}: Props) {
    const isEditing = useMemo(
        () => widgets.getIn(['_internal', 'isEditing']) as boolean,
        [widgets],
    )

    const integrationsPath = useMemo(
        () =>
            getSourcePathFromContext(
                WidgetEnvironment.Ticket,
                'integrations',
            ) as string[],
        [],
    )

    const { effectiveSource } = useWidgetData({
        source: sources,
        path: integrationsPath,
        customerId,
    })

    const contextFilteredItems = useMemo(() => {
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

    const customWidgets = useMemo(() => {
        return toWidgetArray(
            contextFilteredItems?.filter(
                (w) => !NAMED_INTEGRATION_WIDGET_TYPES.has(getWidgetType(w)),
            ) as List<Map<string, unknown>> | undefined,
        )
    }, [contextFilteredItems])

    if (!isEditing && customWidgets.length === 0) {
        return null
    }

    const isDragging =
        isEditing &&
        (widgets.getIn(['_internal', 'drag', 'isDragging'], false) as boolean)

    const allItems = toWidgetArray(contextFilteredItems)

    return (
        <div className={css.integrationContainer}>
            <EditionContext.Provider value={{ isEditing }}>
                <DragWrapper
                    sort
                    group={{
                        name: 'root',
                        pull: false,
                        put: true,
                    }}
                    isEditing={isEditing}
                    watchDrop
                    tag={null}
                    filter={NAMED_WIDGET_PLACEHOLDER_FILTER}
                >
                    <div
                        className={css.integrationContent}
                        data-dragging={isDragging}
                    >
                        {allItems.map((widget, index) => {
                            const isNamed = NAMED_INTEGRATION_WIDGET_TYPES.has(
                                getWidgetType(widget),
                            )

                            if (isNamed) {
                                return (
                                    <div
                                        key={getWidgetId(widget)}
                                        className={`draggable named-widget-placeholder ${css.namedWidgetPlaceholder}`}
                                    />
                                )
                            }

                            return (
                                <CustomWidgetItem
                                    key={getWidgetId(widget) ?? `new-${index}`}
                                    widget={widget}
                                    sources={effectiveSource}
                                    widgetIndex={index}
                                    fallbackIndex={index}
                                />
                            )
                        })}
                    </div>
                </DragWrapper>
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
