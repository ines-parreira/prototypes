import { useMemo } from 'react'

import { fromJS } from 'immutable'
import type { List, Map } from 'immutable'

import { EditionContext } from 'providers/infobar/EditionContext'
import { NAMED_INTEGRATION_WIDGET_TYPES } from 'state/widgets/constants'
import type { WidgetsState } from 'state/widgets/types'
import { WidgetEnvironment } from 'state/widgets/types'
import { itemsWithContext } from 'state/widgets/utils'

import CustomWidgetItem from './CustomWidgetItem'
import WidgetEditionTools from './WidgetEditionTools'

import css from './TicketInfobarContainer.less'

type Props = {
    sources: Map<string, unknown>
    widgets: WidgetsState
}

export default function CustomIntegrationsTabContent({
    sources,
    widgets,
}: Props) {
    const isEditing = useMemo(
        () => widgets.getIn(['_internal', 'isEditing']) as boolean,
        [widgets],
    )

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
        return (
            contextFilteredItems
                ?.filter(
                    (w) =>
                        !NAMED_INTEGRATION_WIDGET_TYPES.has(
                            w?.get('type') as string,
                        ),
                )
                .toArray() ?? []
        )
    }, [contextFilteredItems])

    if (customWidgets.length === 0) {
        return null
    }

    return (
        <div className={css.integrationContainer}>
            <EditionContext.Provider value={{ isEditing }}>
                <div className={css.integrationContent}>
                    {customWidgets.map((widget, index) => {
                        const widgetIndex =
                            contextFilteredItems.findIndex(
                                (w) => w?.get('id') === widget.get('id'),
                            ) ?? -1

                        return (
                            <CustomWidgetItem
                                key={widget.get('id') as number}
                                widget={widget}
                                sources={sources}
                                widgetIndex={widgetIndex}
                                fallbackIndex={index}
                            />
                        )
                    })}
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
