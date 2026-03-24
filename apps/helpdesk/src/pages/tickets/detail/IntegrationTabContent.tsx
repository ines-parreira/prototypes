import type { ComponentType } from 'react'
import { useMemo } from 'react'

import { fromJS } from 'immutable'
import type { List, Map } from 'immutable'

import type { Source, Template } from 'models/widget/types'
import { EditionContext } from 'providers/infobar/EditionContext'
import type { WidgetsState } from 'state/widgets/types'
import { WidgetEnvironment } from 'state/widgets/types'
import { itemsWithContext } from 'state/widgets/utils'
import { WidgetContextProvider } from 'Widgets/contexts/WidgetContext'
import type { WidgetProps } from 'Widgets/modules/Widget'

import WidgetEditionTools from './WidgetEditionTools'

import css from './TicketInfobarContainer.less'

type Props = {
    sources: Map<string, unknown>
    widgets: WidgetsState
    widgetType: string
    sourcePath: string[]
    WidgetComponent: ComponentType<WidgetProps>
}

export default function IntegrationTabContent({
    sources,
    widgets,
    widgetType,
    sourcePath,
    WidgetComponent,
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

    const integrationWidget = useMemo(() => {
        return contextFilteredItems?.find((w) => w?.get('type') === widgetType)
    }, [contextFilteredItems, widgetType])

    const integrationWidgetIndex = useMemo(() => {
        if (!contextFilteredItems || !integrationWidget) return -1
        return contextFilteredItems.findIndex(
            (w) => w?.get('id') === integrationWidget.get('id'),
        )
    }, [contextFilteredItems, integrationWidget])

    const source = useMemo(
        () => sources.getIn(sourcePath) as Map<string, unknown> | undefined,
        [sources, sourcePath],
    )

    if (!integrationWidget || !source) {
        return null
    }

    const template = integrationWidget.get('template') as Map<string, unknown>
    const passedTemplate = {
        ...(template.toJS() as Template),
        templatePath: `${integrationWidgetIndex}.template`,
        absolutePath: sourcePath,
    }

    return (
        <div className={css.integrationContainer}>
            <EditionContext.Provider value={{ isEditing }}>
                <div className={css.integrationContent}>
                    <WidgetContextProvider value={integrationWidget}>
                        <WidgetComponent
                            source={source.toJS() as Source}
                            template={passedTemplate}
                        />
                    </WidgetContextProvider>
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
