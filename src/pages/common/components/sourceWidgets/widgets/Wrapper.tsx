import React from 'react'
import classnames from 'classnames'
import {fromJS, List, Map} from 'immutable'
import _last from 'lodash/last'

import {humanizeString} from 'utils'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationById} from 'state/integrations/selectors'
import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'
import {WIDGET_COLOR_SUPPORTED_TYPES} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/constants.js'
import infobarWidgetCss from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/Wrapper.less'

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

    const integrationId = parseInt(_last(absolutePath) || '', 10)
    const integration = useAppSelector(getIntegrationById(integrationId))

    if (children.isEmpty()) {
        return null
    }

    let displayName = null

    // If the last item of the path is an `int`, it's the id of an integration; therefore we display the
    // integration name or type depending on its type.
    // If it's not an `int`, we just display the last item, humanized.
    if (!isNaN(integrationId)) {
        if (integration.get('type') === 'http') {
            displayName = integration.get('name')
        } else if (integration.get('type') === 'smooch_inside') {
            displayName = 'Chat'
        } else {
            displayName = humanizeString(integration.get('type'))
        }
    } else {
        displayName = humanizeString(_last(absolutePath) || '')
    }

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
        </div>
    )
}
