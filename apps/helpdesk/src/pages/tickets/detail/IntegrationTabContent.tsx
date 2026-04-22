import type { ComponentType } from 'react'
import { useMemo } from 'react'

import { fromJS } from 'immutable'
import type { List, Map } from 'immutable'

import type { Source, Template } from 'models/widget/types'
import { canDisplayWidget } from 'pages/common/components/infobar/utils'
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
    sourcePaths: string[][]
    WidgetComponent: ComponentType<WidgetProps>
}

export default function IntegrationTabContent({
    sources,
    widgets,
    widgetType,
    sourcePaths,
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

    const widgetInstances = useMemo(() => {
        if (!integrationWidget) return []
        const template = (
            integrationWidget.get('template') as Map<string, unknown>
        ).toJS() as Template

        if (isEditing) {
            for (const path of sourcePaths) {
                const source = sources.getIn(path) as
                    | Map<string, unknown>
                    | undefined
                if (
                    source &&
                    canDisplayWidget(template, source, source.toJS() as Source)
                ) {
                    return [{ sourcePath: path, source }]
                }
            }
            return []
        }

        return sourcePaths
            .map((path) => ({
                sourcePath: path,
                source: sources.getIn(path) as Map<string, unknown> | undefined,
            }))
            .filter((instance) => {
                if (!instance.source) return false
                return canDisplayWidget(
                    template,
                    instance.source,
                    instance.source.toJS() as Source,
                )
            })
    }, [sources, sourcePaths, integrationWidget, isEditing])

    if (!integrationWidget || widgetInstances.length === 0) {
        return null
    }

    const template = integrationWidget.get('template') as Map<string, unknown>

    return (
        <div className={css.integrationContainer}>
            <EditionContext.Provider value={{ isEditing }}>
                <div className={css.integrationContent}>
                    {widgetInstances.map(({ sourcePath, source }) => {
                        const passedTemplate = {
                            ...(template.toJS() as Template),
                            templatePath: `${integrationWidgetIndex}.template`,
                            absolutePath: sourcePath,
                        }
                        return (
                            <WidgetContextProvider
                                key={sourcePath.join('.')}
                                value={integrationWidget}
                            >
                                <WidgetComponent
                                    source={
                                        (
                                            source as Map<string, unknown>
                                        ).toJS() as Source
                                    }
                                    template={passedTemplate}
                                />
                            </WidgetContextProvider>
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
