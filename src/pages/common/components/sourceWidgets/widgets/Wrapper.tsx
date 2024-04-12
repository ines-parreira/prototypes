import React, {useContext} from 'react'
import classnames from 'classnames'

import {
    WOOCOMMERCE_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
} from 'state/widgets/constants'
import {getIntegrationById} from 'state/integrations/selectors'
import {isSourceRecord, Source, WrapperTemplate} from 'models/widget/types'
import useAppSelector from 'hooks/useAppSelector'
import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'
import {WidgetContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/WidgetContext'
import {getWidgetTitle} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/helpers'
import WidgetPanel from 'Infobar/features/WidgetPanel/components/WidgetPanel'

import css from './Wrapper.less'

type Props = {
    source: Source
    template: WrapperTemplate
    children: React.ReactNode
}

export default function Wrapper({template, source, children}: Props) {
    const widget = useContext(WidgetContext)
    const absolutePath = template.absolutePath || []
    const widgetType = widget.type

    let integrationId: number | undefined | string
    if (widgetType === WOOCOMMERCE_WIDGET_TYPE) {
        const store = isSourceRecord(source) && source.store
        const helpdesk_integration_id =
            isSourceRecord(store) && store.helpdesk_integration_id
        integrationId =
            typeof helpdesk_integration_id === 'number' ||
            typeof helpdesk_integration_id === 'string'
                ? helpdesk_integration_id
                : undefined
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

    if (!template.widgets?.length && widgetType !== STANDALONE_WIDGET_TYPE) {
        return null
    }

    const displayName = getWidgetTitle({
        source: source,
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
                            {children}
                        </DragWrapper>
                    </div>
                )}
            </WidgetPanel>
        </div>
    )
}
