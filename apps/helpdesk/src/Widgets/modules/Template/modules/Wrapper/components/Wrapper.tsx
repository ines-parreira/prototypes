import type React from 'react'
import { useContext } from 'react'

import classnames from 'classnames'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import _last from 'lodash/last'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { Integration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import type { Source, Template, WrapperTemplate } from 'models/widget/types'
import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'
import {
    getWidgetId,
    getWidgetTitle,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/helpers'
import { AppContext } from 'providers/infobar/AppContext'
import { EditionContext } from 'providers/infobar/EditionContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import * as integrationsSelectors from 'state/integrations/selectors'
import {
    removeEditedWidget,
    startWidgetEdition,
    stopWidgetEdition,
    updateEditedWidget,
} from 'state/widgets/actions'
import {
    CUSTOM_WIDGET_TYPE,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
    WOOCOMMERCE_WIDGET_TYPE,
} from 'state/widgets/constants'
import type { WidgetType } from 'state/widgets/types'
import { WidgetContext } from 'Widgets/contexts/WidgetContext'
import { EXPAND_CONTAINER_MARKER } from 'Widgets/modules/Template/config/template'
import WidgetPanel from 'Widgets/modules/WidgetPanel'

import WrapperEditActions from './views/WrapperEditActions'

import css from './Wrapper.less'

export const CUSTOMIZE_WIDGET_BUTTON_TEXT = 'Customize Widget'
export const DELETE_WIDGET_BUTTON_TEXT = 'Delete Widget'
export const CUSTOMIZABLE_WIDGET_TYPES = [
    IntegrationType.Http,
    CUSTOM_WIDGET_TYPE,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
    WOOCOMMERCE_WIDGET_TYPE,
]

type Props = {
    source: Source
    template: WrapperTemplate
    children: React.ReactNode
}

export default function Wrapper({ template, source, children }: Props) {
    const dispatch = useAppDispatch()
    const widget = useContext(WidgetContext)
    const { isEditing } = useContext(EditionContext)

    const absolutePath = template.absolutePath || []
    const templatePath = template.templatePath || ''

    const widgetType = widget.type
    const integrationId = widget.integration_id
    const integration = useIntegration(
        absolutePath,
        widgetType,
        Number(integrationId),
    )

    const widgetName = getWidgetTitle({
        source: source,
        template: template,
        widgetType,
        appId: widget.app_id,
        integration: integration?.toJS(),
    })
    const widgetId = getWidgetId(widgetName)

    return (
        <AppContext.Provider
            value={{
                appId: widget.app_id || null,
            }}
        >
            <IntegrationContext.Provider
                value={{
                    integration,
                    integrationId: integration.get('id', null),
                }}
            >
                <div
                    {...{ [EXPAND_CONTAINER_MARKER]: true }}
                    className={classnames('draggable', css.widgetWrapper, {
                        [css.widgetWrapperEditing]: isEditing,
                    })}
                >
                    <WidgetPanel
                        widgetType={widgetType}
                        customColor={template.meta?.color}
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
                                                absolutePath,
                                            ),
                                        )
                                    }}
                                    initialData={
                                        CUSTOMIZABLE_WIDGET_TYPES.includes(
                                            widgetType,
                                        )
                                            ? {
                                                  color:
                                                      template.meta?.color ||
                                                      '',
                                              }
                                            : undefined
                                    }
                                    onEditStart={() => {
                                        dispatch(
                                            startWidgetEdition(templatePath),
                                        )
                                    }}
                                    onEditCancel={() => {
                                        dispatch(stopWidgetEdition())
                                    }}
                                    onEditSubmit={({ color }) => {
                                        dispatch(
                                            updateEditedWidget({
                                                type: 'wrapper',
                                                meta: {
                                                    color,
                                                },
                                            }),
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
                            {children}
                        </DragWrapper>
                    </WidgetPanel>
                </div>
            </IntegrationContext.Provider>
        </AppContext.Provider>
    )
}

export function useIntegration(
    absolutePath: Template['absolutePath'],
    widgetType: WidgetType,
    integration_id: number,
) {
    const lastAbsolutePath = _last(absolutePath) || ''
    let integrationId = null
    // Check for uuid, and if it is not in the path, then the leaf is the integration id
    if (
        typeof lastAbsolutePath === 'string' &&
        !lastAbsolutePath.includes('-')
    ) {
        integrationId = parseInt(lastAbsolutePath)
    } else {
        integrationId = integration_id
    }

    const integration = useAppSelector(
        integrationsSelectors.getIntegrationById(integrationId),
    )

    const integrations = useAppSelector(
        integrationsSelectors.getIntegrationsByType<Integration>(widgetType),
    )

    if (isNaN(integrationId)) {
        return (
            integrations.length === 0 ? fromJS({}) : fromJS(integrations[0])
        ) as Map<any, any>
    }

    return integration
}
