import React, {useContext, memo} from 'react'
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
    WOOCOMMERCE_WIDGET_TYPE,
} from 'state/widgets/constants'
import {WidgetEnvironment, WidgetType} from 'state/widgets/types'
import {getWidgetsState} from 'state/widgets/selectors'
import {EditionContext} from 'providers/infobar/EditionContext'
import {canDisplayWidget} from 'pages/common/components/infobar/utils'
import {getWidgetTitle} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/helpers'
import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'

import {CustomerEcommerceData} from 'models/customerEcommerceData/types'
import {ImmutableSource, Source, Template} from 'models/widget/types'
import css from './InfobarWidgets.less'
import {InfobarTabs} from './InfobarTabs'
import Placeholder from './widgets/Placeholder'
import InfobarWidget from './InfobarWidget'

// This is to avoid circular dependencies while doing recursion
import {widgetReference} from './widgetReference'
import {WidgetContextProvider} from './WidgetContext'

widgetReference.Widget = InfobarWidget

type DisplayList = Array<
    | {
          type: 'data'
          integrationId: number
      }
    | {type: 'widget'; widget: Map<string, unknown> | undefined}
>

type PreparedDisplayList = {
    type?: 'placeholder'
    integration?: Maybe<Integration>
    widget: Map<string, unknown>
    template: Map<string, unknown>
    open: boolean
    source?: Source
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
    const {isEditing} = useContext(EditionContext)
    if (!widgets) {
        return null
    }

    const className = classnames(css.widgetsList, {
        editing: isEditing,
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
            WOOCOMMERCE_WIDGET_TYPE,
            STANDALONE_WIDGET_TYPE,
        ].includes(widget?.get('type') as string)
    )

    // We build a single list of all elements we want to display
    const displayList: DisplayList = []

    if (!isEditing) {
        integrationDatas.forEach((_, integrationId) => {
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
        source,
        widgets,
        displayList,
        integrations,
        genericSourcePath,
        isEditing,
    })

    const widgetTabNames = preparedDisplayList.map((item) => {
        const widget = item.widget
        const title = getWidgetTitle({
            source: item.source,
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
                                false
                            )
                        )
                    }
                >
                    <Widgets
                        isEditing={isEditing}
                        preparedDisplayList={preparedDisplayList}
                    />
                </div>
            </DragWrapper>
        </>
    )
}

export default memo(InfobarWidgets)

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
    displayList: DisplayList
    integrations: Integration[]
    genericSourcePath: string[]
    isEditing?: boolean
}) {
    let preparedDisplayList: PreparedDisplayList = []

    // Create a list `prepareDisplayList` of item containing enough data to generate widget components.
    // For each widget OR customerIntegrationData found in displayList, prepare the widget OR retrieve the
    // associated widget, set its template `absolutePath`, `templatePath` when needed
    displayList.forEach((item, displayListIndex) => {
        let widget: Map<string, unknown> = fromJS({})
        let integration: Integration | undefined
        let sourcePath = genericSourcePath.slice()

        if (item.type === 'widget') {
            widget = item.widget || fromJS({})
            const widgetType = widget.get('type') as string

            if (
                widgetType === CUSTOM_WIDGET_TYPE ||
                widgetType === STANDALONE_WIDGET_TYPE
            ) {
                sourcePath = getSourcePathFromContext(
                    widget.get('context') as WidgetEnvironment,
                    widgetType
                ) as string[]
            } else if (widgetType === CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE) {
                sourcePath = getSourcePathFromContext(
                    widget.get('context') as WidgetEnvironment,
                    widgetType
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
                    widgetType
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
                    ecommerceData
                ).find(
                    ([, customerEcommerceData]) =>
                        customerEcommerceData.store.helpdesk_integration_id ===
                        integrationId
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
                        (integration) => integration.type === widgetType
                    )
                } else {
                    selectedIntegrations = integrations.filter(
                        (integration: Integration) =>
                            integration.id.toString() ===
                            (
                                widget.get('integration_id', '') as string
                            )?.toString()
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

        const widgetSource = (
            source.getIn(sourcePath, fromJS({})) as ImmutableSource
        )?.toJS() as Source

        const template = (
            widget.get('template', fromJS({})) as Map<string, unknown>
        ).set('absolutePath', sourcePath)

        if (
            !isEditing &&
            !canDisplayWidget(template.toJS(), source, widgetSource)
        ) {
            return
        }

        preparedDisplayList.push({
            integration,
            widget,
            template,
            open: displayListIndex === 0,
            source: widgetSource,
        })
    })

    // Here we add the non-displayed widgets to the list.
    if (isEditing) {
        const displayedWidgetsIds = preparedDisplayList.map(
            (item) => item.widget.get('id') as string
        )

        const nonDisplayedWidgets = widgets.filter(
            (widget = fromJS({})) =>
                !displayedWidgetsIds.includes(widget.get('id') as string)
        )

        const nonDisplayedItems: PreparedDisplayList = []
        nonDisplayedWidgets.forEach((widget = fromJS({})) => {
            const template = (
                widget.get('template', fromJS({})) as Map<string, unknown>
            ).set('absolutePath', genericSourcePath)

            nonDisplayedItems.push({
                widget,
                template,
                open: false,
                type: 'placeholder',
            })
        })

        preparedDisplayList = preparedDisplayList.concat(nonDisplayedItems)
    }

    return preparedDisplayList.sort((a, b) =>
        compare(a.widget.get('order'), b.widget.get('order'))
    )
}

// This is where we remove immutable and start using plain JS objects for now
function Widgets({
    isEditing,
    preparedDisplayList,
}: {
    isEditing: boolean
    preparedDisplayList: PreparedDisplayList
}) {
    // We create the components separately from the rest of the function because we want to assign `templatePath`
    // AFTER having sorted the results by `widget.order`.
    return (
        <>
            {preparedDisplayList.map((item, index) => {
                const template = {
                    ...(item.template.toJS() as Template),
                    templatePath: `${index}.template`,
                }
                const widget = item.widget

                if (item.type === 'placeholder') {
                    return (
                        <WidgetContextProvider
                            value={widget}
                            key={`${
                                template.absolutePath?.join('.') || ''
                            }-${index}`}
                        >
                            <Placeholder
                                isEditing={isEditing}
                                template={template}
                            />
                        </WidgetContextProvider>
                    )
                }

                return (
                    <WidgetContextProvider
                        value={widget}
                        key={`${
                            template.absolutePath?.join('.') || ''
                        }-${index}`}
                    >
                        <InfobarWidget
                            source={item.source}
                            template={template}
                            isOpen={item.open}
                        />
                    </WidgetContextProvider>
                )
            })}
        </>
    )
}
