import type { ComponentType } from 'react'
import { useMemo } from 'react'

import { fromJS } from 'immutable'
import type { List, Map } from 'immutable'

import type { Source, Template } from 'models/widget/types'
import { useWidgetData } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/helpers'
import { canDisplayWidget } from 'pages/common/components/infobar/utils'
import { CustomerContext } from 'providers/infobar/CustomerContext'
import { EditionContext } from 'providers/infobar/EditionContext'
import type { WidgetsState } from 'state/widgets/types'
import { WidgetEnvironment } from 'state/widgets/types'
import { getSourcePathFromContext, itemsWithContext } from 'state/widgets/utils'
import { WidgetContextProvider } from 'Widgets/contexts/WidgetContext'
import type { WidgetProps } from 'Widgets/modules/Widget'

import { WidgetEditionTools } from './WidgetEditionTools'

import css from './TicketInfobarContainer.less'

type Props = {
    sources: Map<string, unknown>
    widgets: WidgetsState
    widgetType: string
    sourcePaths: string[][]
    WidgetComponent: ComponentType<WidgetProps>
    customerId?: number | null
}

export function IntegrationTabContent({
    sources,
    widgets,
    widgetType,
    sourcePaths,
    WidgetComponent,
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
                const source = effectiveSource.getIn(path) as
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
                source: effectiveSource.getIn(path) as
                    | Map<string, unknown>
                    | undefined,
            }))
            .filter((instance) => {
                if (!instance.source) return false
                return canDisplayWidget(
                    template,
                    instance.source,
                    instance.source.toJS() as Source,
                )
            })
    }, [effectiveSource, sourcePaths, integrationWidget, isEditing])

    if (!integrationWidget || widgetInstances.length === 0) {
        return null
    }

    const template = integrationWidget.get('template') as Map<string, unknown>

    return (
        <div className={css.integrationContainer}>
            <EditionContext.Provider value={{ isEditing }}>
                <CustomerContext.Provider
                    value={{ customerId: customerId ?? null }}
                >
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
                </CustomerContext.Provider>
            </EditionContext.Provider>
        </div>
    )
}
