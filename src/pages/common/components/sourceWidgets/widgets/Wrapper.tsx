import React, {useContext} from 'react'
import classnames from 'classnames'
import {Map} from 'immutable'

import {
    WOOCOMMERCE_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
} from 'state/widgets/constants'
import {getIntegrationById} from 'state/integrations/selectors'
import {WrapperTemplate} from 'models/widget/types'
import useAppSelector from 'hooks/useAppSelector'
import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'
import {WidgetContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/WidgetContext'
import {getWidgetTitle} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/helpers'
import WidgetPanel from 'Infobar/features/WidgetPanel/components/WidgetPanel'

// This is to avoid circular dependencies while doing recursion
import {widgetReference} from '../widgetReference'
import css from './Wrapper.less'

type Props = {
    source: Map<string, unknown>
    template: WrapperTemplate
}

export default function Wrapper({template, source}: Props) {
    const widget = useContext(WidgetContext)
    const SourceWidget = widgetReference.Widget
    const absolutePath = template.absolutePath || []
    const templatePath = template.templatePath || ''
    const children = template.widgets
    const widgetType = widget.type

    let integrationId: number | undefined | string
    if (widgetType === WOOCOMMERCE_WIDGET_TYPE) {
        integrationId = source?.getIn(['store', 'helpdesk_integration_id'])
    } else {
        integrationId = absolutePath[absolutePath.length - 1]
    }

    const integration = useAppSelector(
        getIntegrationById(
            typeof integrationId === 'number'
                ? integrationId
                : parseInt(integrationId || '', 10)
        )
    )

    if (!children?.length && widgetType !== STANDALONE_WIDGET_TYPE) {
        return null
    }

    const displayName = getWidgetTitle({
        source: source?.toJS(),
        template: template,
        widgetType: widgetType,
        appId: widget.app_id,
        integration: integration?.toJS(),
    })

    return (
        <div
            className={classnames('draggable', css.sourceWrapper)}
            data-key={absolutePath.join('.')}
        >
            <WidgetPanel widgetType={widgetType}>
                <div className={css.sourceWrapperHeader}>
                    <i className="material-icons">drag_indicator</i>
                    {displayName}
                </div>
                {widgetType !== STANDALONE_WIDGET_TYPE && (
                    <div>
                        <DragWrapper
                            group={{
                                name: absolutePath.join('.') || '',
                                pull: true,
                                put: false,
                            }}
                            isEditing
                        >
                            {children?.map((childTemplate, index) => {
                                if (!childTemplate || typeof index !== 'number')
                                    return null
                                const passedTemplate = {
                                    ...childTemplate,
                                    templatePath: `${templatePath}.widgets.${index}`,
                                }

                                return (
                                    <SourceWidget
                                        key={`${
                                            passedTemplate.path || ''
                                        }-${index}`}
                                        source={source}
                                        parent={template}
                                        template={passedTemplate}
                                    />
                                )
                            })}
                        </DragWrapper>
                    </div>
                )}
            </WidgetPanel>
        </div>
    )
}
