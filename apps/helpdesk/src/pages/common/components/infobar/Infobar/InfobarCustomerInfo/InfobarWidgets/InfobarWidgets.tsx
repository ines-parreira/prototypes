import React, { useContext, useMemo } from 'react'

import classnames from 'classnames'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import type { CustomerEcommerceData } from 'models/customerEcommerceData/types'
import type { Integration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import type { ImmutableSource, Source, Template } from 'models/widget/types'
import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'
import { useWidgetData } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/helpers'
import { getWidgetTitle } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/helpers'
import { canDisplayWidget } from 'pages/common/components/infobar/utils'
import { CustomerContext } from 'providers/infobar/CustomerContext'
import { EditionContext } from 'providers/infobar/EditionContext'
import { getIntegrations } from 'state/integrations/selectors'
import {
    CUSTOM_WIDGET_TYPE,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
    WOOCOMMERCE_WIDGET_TYPE,
} from 'state/widgets/constants'
import { getWidgetsState } from 'state/widgets/selectors'
import type { WidgetEnvironment, WidgetType } from 'state/widgets/types'
import { getSourcePathFromContext } from 'state/widgets/utils'
import { compare } from 'utils'
import RootWidget from 'Widgets/modules/Widget'

import { InfobarTabs } from './InfobarTabs'

import css from './InfobarWidgets.less'

const Widget = React.memo(RootWidget)

type DisplayList = Array<
    | {
          type: 'data'
          integrationId: number
      }
    | { type: 'widget'; widget: Map<string, unknown> | undefined }
>

type PreparedDisplayList = {
    type?: 'placeholder'
    integration?: Maybe<Integration>
    widget: Map<string, unknown>
    template: Map<string, unknown>
    absolutePath?: (number | string)[]
}[]

type Props = {
    context: WidgetEnvironment
    source: Map<string, unknown>
    widgets: Maybe<List<Map<string, unknown>>>
    displayTabs?: boolean
}

const InfobarWidgets = ({
    context,
    source = fromJS({}),
    widgets,
    displayTabs,
}: Props) => {
    const integrations = useAppSelector(getIntegrations)
    const widgetState = useAppSelector(getWidgetsState)
    const { isEditing } = useContext(EditionContext)
    const { customerId } = useContext(CustomerContext)

    const path = useMemo(
        () => getSourcePathFromContext(context, 'integrations') as string[],
        [context],
    )

    const { integrationData, effectiveSource } = useWidgetData({
        source,
        path,
        customerId,
    })

    if (!widgets) {
        return null
    }

    const className = classnames(css.widgetsList, {
        editing: isEditing,
    })

    const widgetsWithoutIntegration = widgets.filter((widget) =>
        [
            CUSTOM_WIDGET_TYPE,
            CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
            WOOCOMMERCE_WIDGET_TYPE,
            STANDALONE_WIDGET_TYPE,
        ].includes(widget?.get('type') as string),
    )

    // We build a single list of all elements we want to display
    const displayList: DisplayList = []

    if (!isEditing) {
        integrationData.forEach((_, integrationId) => {
            if (typeof integrationId === 'undefined') return
            displayList.push({
                type: 'data',
                integrationId,
            })
        })
        widgetsWithoutIntegration.forEach((widget) => {
            displayList.push({
                type: 'widget',
                widget,
            })
        })
    } else {
        widgets.forEach((widget) => {
            displayList.push({
                type: 'widget',
                widget,
            })
        })
    }

    const preparedDisplayList = getPreparedDisplayList({
        source: effectiveSource,
        widgets,
        displayList,
        integrations,
        path,
        isEditing,
    })

    const widgetTabNames = preparedDisplayList.map((item) => {
        const widget = item.widget
        const title = getWidgetTitle({
            source: (
                effectiveSource.getIn(item.absolutePath || []) as Map<
                    string,
                    unknown
                >
            )?.toJS() as Source,
            template: item.template.toJS() as Template,
            widgetType: item.widget.get('type') as WidgetType,
            integration: item.integration,
            appId: widget.get('app_id') as Maybe<string>,
        })
        return title
    })

    return (
        <>
            {displayTabs && !isEditing && (
                <InfobarTabs widgetNames={widgetTabNames} />
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
                <div
                    className={className}
                    data-dragging={
                        !!(
                            isEditing &&
                            widgetState.getIn(
                                ['_internal', 'drag', 'isDragging'],
                                false,
                            )
                        )
                    }
                >
                    {preparedDisplayList.map((item, index) => {
                        let passedSource: Map<string, unknown> | undefined =
                            undefined
                        if (
                            item.widget.get('type') !== STANDALONE_WIDGET_TYPE
                        ) {
                            passedSource = effectiveSource.getIn(
                                item.absolutePath || [],
                            )
                        }
                        // it is very important we get stable props here for memo to work
                        return (
                            <Widget
                                key={`${
                                    item.absolutePath?.join('.') || ''
                                }-${index}`}
                                isEditing={isEditing}
                                index={index}
                                // Since we create a new array on each render, we need to stringify it
                                // for memo to work. We will then parse it back in the component
                                absolutePath={JSON.stringify(
                                    item.absolutePath || [],
                                )}
                                source={passedSource}
                                template={item.template}
                                widget={item.widget}
                                type={item.type}
                            />
                        )
                    })}
                </div>
            </DragWrapper>
        </>
    )
}

export default InfobarWidgets

function getPreparedDisplayList({
    source,
    widgets,
    displayList,
    integrations,
    path,
    isEditing,
}: {
    source: Map<string, unknown>
    widgets: List<Map<string, unknown>>
    displayList: DisplayList
    integrations: Integration[]
    path: string[]
    isEditing?: boolean
}) {
    let preparedDisplayList: PreparedDisplayList = []

    // Create a list `prepareDisplayList` of item containing enough data to generate widget components.
    // For each widget OR customerIntegrationData found in displayList, prepare the widget OR retrieve the
    // associated widget, set its template `absolutePath`, `templatePath` when needed
    displayList.forEach((item) => {
        let widget: Map<string, unknown> = fromJS({})
        let integration: Integration | undefined
        let sourcePath = path.slice()

        if (item.type === 'widget') {
            widget = item.widget || widget
            const widgetType = widget.get('type') as string

            if (widgetType === CUSTOM_WIDGET_TYPE) {
                sourcePath = getSourcePathFromContext(
                    widget.get('context') as WidgetEnvironment,
                    widgetType,
                ) as string[]
            } else if (widgetType === STANDALONE_WIDGET_TYPE) {
                sourcePath = []
            } else if (widgetType === CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE) {
                sourcePath = getSourcePathFromContext(
                    widget.get('context') as WidgetEnvironment,
                    widgetType,
                ) as string[]

                const appId = widget.get('app_id') as string
                if (!appId) {
                    return
                }

                if (source.getIn([...sourcePath, appId])) {
                    sourcePath.push(appId as string[] & string)
                } else return
            } else if (widgetType === WOOCOMMERCE_WIDGET_TYPE) {
                sourcePath = getSourcePathFromContext(
                    widget.get('context') as WidgetEnvironment,
                    widgetType,
                ) as string[]
                const integrationId = widget.get('integration_id') as number
                const ecommerceData: Record<string, CustomerEcommerceData> = (
                    source.getIn(sourcePath) as Map<
                        string,
                        CustomerEcommerceData
                    >
                )?.toJS()
                if (!ecommerceData) {
                    return
                }

                const currentEcommerceDataEntry = Object.entries(
                    ecommerceData,
                ).find(
                    ([, customerEcommerceData]) =>
                        customerEcommerceData.store.helpdesk_integration_id ===
                        integrationId,
                )
                if (!currentEcommerceDataEntry) {
                    return
                }
                const [currentStoreUUID] = currentEcommerceDataEntry
                sourcePath.push(currentStoreUUID)
            } else {
                let selectedIntegrations: Integration[] = []

                if (widgetType !== IntegrationType.Http) {
                    selectedIntegrations = integrations.filter(
                        (integration) => integration.type === widgetType,
                    )
                } else {
                    selectedIntegrations = integrations.filter(
                        (integration: Integration) =>
                            integration.id.toString() ===
                            (
                                widget.get('integration_id', '') as string
                            )?.toString(),
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
        } else if (item.type === 'data') {
            const integrationId = item.integrationId.toString()

            integration = integrations.find(
                (integration) => integration.id.toString() === integrationId,
            )

            if (!integrations.length) {
                return
            }

            if (integration?.type === IntegrationType.Http) {
                widget = findHTTPIntegrationRelatedWidget(
                    integrationId,
                    widgets,
                )
            } else {
                widget = widgets.find(
                    (widget) => widget?.get('type') === integration?.type,
                )
            }

            if (!widget) {
                return
            }

            sourcePath.push(integrationId)
        }

        const template = widget.get('template', fromJS({})) as Map<
            string,
            unknown
        >

        if (
            !isEditing &&
            !(widget.get('type') === STANDALONE_WIDGET_TYPE) &&
            !canDisplayWidget(
                template.toJS(),
                source,
                (
                    source.getIn(sourcePath, fromJS({})) as ImmutableSource
                )?.toJS() as Source,
            )
        ) {
            return
        }

        preparedDisplayList.push({
            widget,
            template,
            integration,
            absolutePath: sourcePath,
        })
    })

    // Here we add the non-displayed widgets to the list.
    if (isEditing) {
        const displayedWidgetsIds = preparedDisplayList.map(
            (item) => item.widget.get('id') as string,
        )

        const nonDisplayedWidgets = widgets.filter(
            (widget = fromJS({})) =>
                !displayedWidgetsIds.includes(widget.get('id') as string),
        )

        const nonDisplayedItems: PreparedDisplayList = []
        nonDisplayedWidgets.forEach((widget = fromJS({})) => {
            nonDisplayedItems.push({
                widget,
                template: widget.get('template', fromJS({})) as Map<
                    string,
                    unknown
                >,
                type: 'placeholder',
                absolutePath: path,
            })
        })

        preparedDisplayList = preparedDisplayList.concat(nonDisplayedItems)
    }

    return preparedDisplayList.sort((a, b) =>
        compare(a.widget.get('order'), b.widget.get('order')),
    )
}

export function findHTTPIntegrationRelatedWidget(
    HTTPIntegrationId: string,
    widgets: List<Map<string, unknown>>,
) {
    return widgets.find((widget) => {
        if (!widget) return false
        return (
            (widget.get('integration_id') as string)?.toString() ===
                HTTPIntegrationId &&
            widget.get('type') !== STANDALONE_WIDGET_TYPE
        )
    })
}
