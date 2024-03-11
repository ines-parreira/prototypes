import React, {useContext} from 'react'
import {Map, fromJS} from 'immutable'
import _last from 'lodash/last'
import classnames from 'classnames'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {Integration} from 'models/integration/types'
import {WidgetType} from 'state/widgets/types'
import {
    removeEditedWidget,
    startWidgetEdition,
    stopWidgetEdition,
    updateEditedWidget,
} from 'state/widgets/actions'
import * as integrationsSelectors from 'state/integrations/selectors'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {EditionContext} from 'providers/infobar/EditionContext'
import {AppContext} from 'providers/infobar/AppContext'
import {
    CUSTOM_WIDGET_TYPE,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    HTTP_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
    WOOCOMMERCE_WIDGET_TYPE,
} from 'state/widgets/constants'

import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'
import {
    getWidgetId,
    getWidgetTitle,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/helpers'
import WrapperEditActions from 'infobar/ui/WrapperEditActions'
import WidgetPanel from 'infobar/features/WidgetPanel'

// This is to avoid circular dependencies while doing recursion
import {widgetReference} from '../widgetReference'

import css from './Wrapper.less'

export const CUSTOMIZE_WIDGET_BUTTON_TEXT = 'Customize Widget'
export const DELETE_WIDGET_BUTTON_TEXT = 'Delete Widget'
export const CUSTOMIZABLE_WIDGET_TYPES = [
    HTTP_WIDGET_TYPE,
    CUSTOM_WIDGET_TYPE,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
    WOOCOMMERCE_WIDGET_TYPE,
]

type Props = {
    source: Map<string, unknown> | undefined
    widget: Map<string, unknown>
    template: Map<string, unknown>
}

export default function Wrapper({widget, template, source}: Props) {
    const dispatch = useAppDispatch()
    const {isEditing} = useContext(EditionContext)

    const InfobarWidget = widgetReference.Widget
    const absolutePath = template.get('absolutePath', []) as string[]
    const templatePath = template.get('templatePath', '') as string

    const widgetType = widget.get('type') as WidgetType
    const integrationId: number = widget.get('integration_id') as number
    const integration = useIntegration(absolutePath, widgetType, integrationId)

    const widgetName = getWidgetTitle({
        source: source?.toJS(),
        template: template.toJS(),
        widgetType,
        appId: widget.get('app_id') as string | undefined,
        integration: integration?.toJS(),
    })
    const widgetId = getWidgetId(widgetName)

    return (
        <AppContext.Provider
            value={{
                appId: widget.get('app_id') as string,
            }}
        >
            <IntegrationContext.Provider
                value={{
                    integration,
                    integrationId: integration.get('id', null),
                }}
            >
                <div
                    className={classnames('draggable', css.widgetWrapper, {
                        [css.widgetWrapperEditing]: isEditing,
                    })}
                >
                    <WidgetPanel
                        widgetType={widgetType}
                        customColor={template.getIn(['meta', 'color'])}
                    >
                        {!isEditing && (
                            <div id={widgetId} className={css.anchor} />
                        )}
                        {isEditing && (
                            <div className={css.widgetWrapperTools}>
                                <WrapperEditActions
                                    deleteButtonText={DELETE_WIDGET_BUTTON_TEXT}
                                    editButtonText={
                                        CUSTOMIZE_WIDGET_BUTTON_TEXT
                                    }
                                    onDelete={() => {
                                        dispatch(
                                            removeEditedWidget(
                                                templatePath,
                                                absolutePath
                                            )
                                        )
                                    }}
                                    initialData={
                                        CUSTOMIZABLE_WIDGET_TYPES.includes(
                                            widgetType
                                        )
                                            ? {
                                                  color: template.getIn(
                                                      ['meta', 'color'],
                                                      ''
                                                  ),
                                              }
                                            : undefined
                                    }
                                    onEditStart={() => {
                                        dispatch(
                                            startWidgetEdition(templatePath)
                                        )
                                    }}
                                    onEditCancel={() => {
                                        dispatch(stopWidgetEdition())
                                    }}
                                    onEditSubmit={({color}) => {
                                        dispatch(
                                            updateEditedWidget({
                                                type: 'wrapper',
                                                meta: {
                                                    color,
                                                },
                                            })
                                        )
                                        dispatch(stopWidgetEdition())
                                    }}
                                />
                            </div>
                        )}

                        <DragWrapper
                            sort
                            group={{
                                name: absolutePath.join('.'),
                                pull: false,
                                put: true,
                            }}
                            templatePath={templatePath}
                            isEditing={isEditing}
                            watchDrop
                        >
                            {(
                                template.get('widgets', fromJS([])) as Map<
                                    number,
                                    unknown
                                >
                            ).map((mappedWidget, index = 0) => {
                                const passedTemplate = (
                                    mappedWidget as Map<string, unknown>
                                ).set(
                                    'templatePath',
                                    `${templatePath}.widgets.${index}`
                                )

                                return (
                                    <InfobarWidget
                                        key={`${
                                            passedTemplate.get('path') as string
                                        }-${index}`}
                                        source={source}
                                        parent={template}
                                        widget={widget}
                                        template={passedTemplate}
                                    />
                                )
                            })}
                        </DragWrapper>
                    </WidgetPanel>
                </div>
            </IntegrationContext.Provider>
        </AppContext.Provider>
    )
}

export function useIntegration(
    absolutePath: string[],
    widgetType: WidgetType,
    integration_id: number
) {
    const lastAbsolutePath = _last(absolutePath) || ''
    let integrationId = null
    // Check for uuid, and if it is not in the path, then the leaf is the integration id
    if (!lastAbsolutePath.includes('-')) {
        integrationId = parseInt(lastAbsolutePath)
    } else {
        integrationId = integration_id
    }

    const integration = useAppSelector(
        integrationsSelectors.getIntegrationById(integrationId)
    )

    const integrations = useAppSelector(
        integrationsSelectors.getIntegrationsByType<Integration>(widgetType)
    )

    if (isNaN(integrationId)) {
        return (
            integrations.length === 0 ? fromJS({}) : fromJS(integrations[0])
        ) as Map<any, any>
    }

    return integration
}
