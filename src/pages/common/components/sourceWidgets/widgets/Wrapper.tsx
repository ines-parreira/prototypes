import React from 'react'
import classnames from 'classnames'
import {fromJS, List, Map} from 'immutable'
import _last from 'lodash/last'

import {
    WOOCOMMERCE_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
} from 'state/widgets/constants'
import {getIntegrationById} from 'state/integrations/selectors'
import useAppSelector from 'hooks/useAppSelector'
import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'
import {WIDGET_COLOR_SUPPORTED_TYPES} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/constants'
import infobarWidgetCss from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/Wrapper.less'
import {getWidgetTitle} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/helpers'

import {WidgetType} from 'state/widgets/types'
import SourceWidget from '../Widget'
import css from './Wrapper.less'

type Props = {
    source: Map<string, unknown>
    parent: Map<string, unknown>
    widget: Map<string, unknown>
    template: Map<string, unknown>
}

export default function Wrapper({widget, template, source, parent}: Props) {
    const absolutePath = template.get('absolutePath') as string[]
    const templatePath = template.get('templatePath') as string
    const children = template.get('widgets', fromJS([])) as List<
        Map<string, unknown>
    >
    const widgetType = widget.get('type') as WidgetType

    let integrationId: number
    if (widgetType === WOOCOMMERCE_WIDGET_TYPE) {
        integrationId = source?.getIn(['store', 'helpdesk_integration_id'])
    } else {
        integrationId = parseInt(_last(absolutePath) || '', 10)
    }

    const integration = useAppSelector(getIntegrationById(integrationId))

    if (children.isEmpty() && widget.get('type') !== STANDALONE_WIDGET_TYPE) {
        return null
    }

    const displayName = getWidgetTitle({
        source: source?.toJS(),
        template: (
            widget.get('template', fromJS({})) as Map<string, unknown>
        ).toJS(),
        widgetType: widgetType,
        appId: widget.get('app_id') as string | undefined,
        integration: integration?.toJS(),
    })

    const type = parent.get('type') as string
    const colorClassNames = []
    if (WIDGET_COLOR_SUPPORTED_TYPES.includes(type))
        colorClassNames.push(infobarWidgetCss[type])

    return (
        <div
            className={classnames(
                'draggable',
                css.sourceWrapper,
                ...colorClassNames
            )}
            data-key={(template.get('path') as string[]).join('.')}
        >
            <div className={css.sourceWrapperHeader}>
                <i className="material-icons">drag_indicator</i>
                {displayName}
            </div>
            {widget.get('type') !== STANDALONE_WIDGET_TYPE && (
                <div>
                    <DragWrapper
                        group={{
                            name: absolutePath.join('.'),
                            pull: true,
                            put: false,
                        }}
                        isEditing
                    >
                        {children.map((childWidget, index) => {
                            if (!childWidget || typeof index !== 'number')
                                return null
                            const passedTemplate = childWidget.set(
                                'templatePath',
                                `${templatePath}.widgets.${index}`
                            )

                            return (
                                <SourceWidget
                                    key={`${
                                        passedTemplate.get('path') as string
                                    }-${index}`}
                                    source={source}
                                    parent={template}
                                    template={passedTemplate}
                                    widget={widget}
                                />
                            )
                        })}
                    </DragWrapper>
                </div>
            )}
        </div>
    )
}
