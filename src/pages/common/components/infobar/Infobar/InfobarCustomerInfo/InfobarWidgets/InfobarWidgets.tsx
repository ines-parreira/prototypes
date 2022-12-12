import React from 'react'
import classnames from 'classnames'
import {List, Map, fromJS} from 'immutable'

import {compare} from 'utils'
import useAppSelector from 'hooks/useAppSelector'
import {Integration, IntegrationType} from 'models/integration/types'
import {getSourcePathFromContext} from 'state/widgets/utils'
import {getIntegrations} from 'state/integrations/selectors'
import {
    CUSTOM_WIDGET_TYPE,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
} from 'state/widgets/constants'
import {WidgetContextType, WidgetType} from 'state/widgets/types'
import {getWidgetName} from 'state/widgets/predicates'
import {canDisplayWidget} from 'pages/common/components/infobar/utils'
import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'
import {Editing} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarCustomerInfo'

import css from './InfobarWidgets.less'
import {InfobarTabs} from './InfobarTabs'
import Placeholder from './widgets/Placeholder'
import {infobarWidgetShouldRender} from './predicates'
import InfobarWidget from './InfobarWidget.js'

type Props = {
    context: WidgetContextType
    editing?: Editing
    source: Map<string, unknown>
    widgets: Maybe<List<Map<string, unknown>>>
    displayTabs?: boolean
}

const InfobarWidgets = ({
    context,
    source = fromJS({}),
    widgets,
    editing,
    displayTabs,
}: Props) => {
    const integrations = useAppSelector(getIntegrations)

    if (!widgets) {
        return null
    }

    const isEditing = Boolean(editing?.isEditing)

    const className = classnames(css.widgetsList, {
        editing: isEditing,
        [css.dragging]: !!(editing && editing.isDragging),
    })

    const genericSourcePath = getSourcePathFromContext(
        context,
        'integrations'
    ) as string[]
    const integrationDatas = source.getIn(
        genericSourcePath,
        fromJS([])
    ) as List<Map<string, unknown>>

    const widgetsWithoutIntegration = widgets.filter((widget) =>
        [
            CUSTOM_WIDGET_TYPE,
            CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
            STANDALONE_WIDGET_TYPE,
        ].includes(widget?.get('type') as string)
    )

    // We build a single list of all elements we want to display
    let displayList = fromJS([]) as List<Map<string, unknown>>

    if (!isEditing) {
        integrationDatas.forEach((_, integrationId) => {
            displayList = displayList.push(
                fromJS({
                    type: 'data',
                    integrationId,
                })
            )
        })
        widgetsWithoutIntegration.forEach((widget) => {
            displayList = displayList.push(
                fromJS({
                    type: 'widget',
                    widget,
                })
            )
        })
    } else {
        widgets.forEach((widget) => {
            displayList = displayList.push(
                fromJS({
                    type: 'widget',
                    widget,
                })
            )
        })
    }

    const preparedDisplayList = getPreparedDisplayList({
        source,
        widgets,
        displayList,
        integrations,
        genericSourcePath,
        isEditing,
    })

    const widgetNames = preparedDisplayList
        .map((item = fromJS({})) => {
            const widget = item.get('widget') as Map<string, unknown>
            const integration = (
                item.get('integration') as Map<string, unknown> | undefined
            )?.toJS() as Integration
            const templatePath = item.getIn(['template', 'path'])

            const widgetTitle = item.getIn(['template', 'widgets', 0, 'title'])

            return getWidgetName({
                source,
                widgetTitle,
                widgetType: widget.get('type') as WidgetType,
                widgetAppId: widget.get('app_id') as string,
                templatePath,
                integration: integration,
            })
        })
        .toJS() as string[]

    return (
        <>
            {displayTabs && !isEditing && (
                <InfobarTabs widgetNames={widgetNames} />
            )}
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
            >
                <div className={className}>
                    {renderWidgets({source, editing, preparedDisplayList})}
                </div>
            </DragWrapper>
        </>
    )
}

export default InfobarWidgets

function renderWidgets({
    source,
    editing,
    preparedDisplayList,
}: {
    source: Map<string, unknown>
    editing?: Editing
    preparedDisplayList: List<Map<string, unknown>>
}) {
    const isEditing = Boolean(editing?.isEditing)

    if (!infobarWidgetShouldRender(source)) {
        return null
    }

    // We create the components separately from the rest of the function because we want to assign `templatePath`
    // AFTER having sorted the results by `widget.order`.
    return preparedDisplayList.map((item = fromJS({}), index) => {
        const order = item.getIn(['widget', 'order']) as number
        const newItem = item.set(
            'template',
            (item.get('template') as Map<string, unknown>).set(
                'templatePath',
                `${order}.template`
            )
        )

        if (typeof index === 'undefined') return null

        if (item.get('type') === 'placeholder') {
            return (
                <Placeholder
                    key={`${(
                        newItem.getIn(['template', 'path'], []) as string[]
                    ).toString()}-${index}`}
                    source={source}
                    widget={newItem.get('widget') as Map<string, unknown>}
                    template={newItem.get('template') as Map<any, any>}
                    editing={editing}
                />
            )
        }

        return (
            <InfobarWidget
                key={`${(
                    newItem.getIn(['template', 'path'], []) as string[]
                ).toString()}-${index}`}
                source={source}
                widget={newItem.get('widget')}
                template={newItem.get('template')}
                editing={editing}
                isEditing={isEditing}
                open={newItem.get('open')}
            />
        )
    })
}

function getPreparedDisplayList({
    source,
    widgets,
    displayList,
    integrations,
    genericSourcePath,
    isEditing,
}: {
    source: Map<string, unknown>
    widgets: List<Map<string, unknown>>
    displayList: List<Map<string, unknown>>
    integrations: Integration[]
    genericSourcePath: string[]
    isEditing?: boolean
}) {
    let preparedDisplayList: List<Map<string, unknown>> = fromJS([])

    // Create a list `prepareDisplayList` of item containing enough data to generate widget components.
    // For each widget OR customerIntegrationData found in displayList, prepare the widget OR retrieve the
    // associated widget, set its template `path`, `templatePath` when needed
    displayList.forEach((item, displayListIndex) => {
        let widget: Map<string, unknown> = fromJS({})
        let integration: Integration | undefined
        let sourcePath = genericSourcePath.slice()

        if (item?.get('type') === 'widget') {
            widget = item.get('widget', fromJS({})) as Map<string, unknown>
            const widgetType = widget.get('type') as string

            if (
                widgetType === CUSTOM_WIDGET_TYPE ||
                widgetType === STANDALONE_WIDGET_TYPE
            ) {
                sourcePath = getSourcePathFromContext(
                    widget.get('context') as WidgetContextType,
                    widgetType
                ) as string[]
            } else if (widgetType === CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE) {
                sourcePath = getSourcePathFromContext(
                    widget.get('context') as WidgetContextType,
                    widgetType
                ) as string[]

                const appId = widget.get('app_id') as string
                if (!appId) {
                    return
                }

                if (source.getIn([...sourcePath, appId])) {
                    sourcePath.push(appId as string[] & string)
                } else return
            } else {
                let selectedIntegrations: Integration[] = []

                if (widgetType !== IntegrationType.Http) {
                    selectedIntegrations = integrations.filter(
                        (integration) => integration.type === widgetType
                    )
                } else {
                    selectedIntegrations = integrations.filter(
                        (integration: Integration) =>
                            integration.id.toString() ===
                            (
                                widget.get('integration_id', '') as string
                            ).toString()
                    )
                }

                if (!selectedIntegrations.length) {
                    return
                }

                selectedIntegrations.forEach((selectedIntegration) => {
                    const tmpSourcePath = sourcePath.slice()
                    tmpSourcePath.push(selectedIntegration.id.toString())

                    // If there's something in source at sourcePath, the customer has data for this integration,
                    // so we can display the widget
                    if (source.getIn(tmpSourcePath)) {
                        integration = selectedIntegration
                    }
                })

                if (!integration) {
                    return
                }

                sourcePath.push(integration.id.toString())
            }
        } else if (item?.get('type') === 'data') {
            const integrationId = (
                item.get('integrationId') as string
            ).toString()

            integration = integrations.find(
                (integration) => integration.id.toString() === integrationId
            )

            if (!integrations.length) {
                return
            }

            if (integration?.type === IntegrationType.Http) {
                widget = widgets.find(
                    (widget) =>
                        (
                            widget?.get('integration_id') as string
                        )?.toString() === integration?.id.toString()
                )
            } else {
                widget = widgets.find(
                    (widget) => widget?.get('type') === integration?.type
                )
            }

            if (!widget) {
                return
            }

            sourcePath.push(integrationId)
        }

        const template = (
            widget.get('template', fromJS({})) as Map<string, unknown>
        )
            .set('path', sourcePath)
            .set('templatePath', `${widget.get('order') as number}.template`)

        if (!isEditing && !canDisplayWidget(template.toJS(), source)) {
            return
        }

        preparedDisplayList = preparedDisplayList.push(
            fromJS({
                integration,
                widget,
                template,
                open: displayListIndex === 0,
            })
        )
    })

    // Here we add the non-displayed widgets to the list.
    if (isEditing) {
        const displayedWidgetsIds = preparedDisplayList.map(
            (item) => item?.getIn(['widget', 'id']) as string
        )

        const nonDisplayedWidgets = widgets.filter(
            (widget = fromJS({})) =>
                !displayedWidgetsIds.includes(widget.get('id') as string)
        )

        const nonDisplayedItems = nonDisplayedWidgets.map(
            (widget = fromJS({})) => {
                const template = (
                    widget.get('template', fromJS({})) as Map<string, unknown>
                )
                    .set('path', genericSourcePath)
                    .set(
                        'templatePath',
                        `${widget.get('order') as string}.template`
                    )

                return fromJS({
                    widget,
                    template,
                    open: false,
                    type: 'placeholder',
                }) as Map<string, unknown>
            }
        )

        preparedDisplayList = preparedDisplayList.concat(
            nonDisplayedItems
        ) as List<Map<string, unknown>>
    }

    return preparedDisplayList
        .sort((a, b) =>
            compare(a.getIn(['widget', 'order']), b.getIn(['widget', 'order']))
        )
        .toList()
}
