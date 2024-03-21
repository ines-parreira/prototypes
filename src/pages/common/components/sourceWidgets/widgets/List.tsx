import React from 'react'
import {Map} from 'immutable'
import classnames from 'classnames'

import {Template} from 'models/widget/types'

// This is to avoid circular dependencies while doing recursion
import {widgetReference} from '../widgetReference'

type Props = {
    source: Map<string, unknown>
    widget: Map<string, unknown>
    template: Template
    isParentList: boolean
}

export default function List({
    source,
    widget,
    template,
    isParentList = false,
}: Props) {
    const SourceWidget = widgetReference.Widget

    if (!template.widgets || !template.widgets[0]) return null

    const passedTemplate = {
        ...template.widgets[0],
        templatePath: `${template.templatePath || ''}.widgets.0`,
    }
    const updatedTemplate = {
        ...template,
        absolutePath: template.absolutePath?.concat(['[]']),
    }
    const className = classnames('list', {
        draggable: !isParentList,
    })

    return (
        <div className={className} data-key={template.path}>
            {source
                .toList()
                .take(1)
                .map((d, i) => {
                    return (
                        <SourceWidget
                            key={i}
                            source={d as Map<string, unknown>}
                            parent={updatedTemplate}
                            template={passedTemplate}
                            widget={widget}
                        />
                    )
                })}
        </div>
    )
}
