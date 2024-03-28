import React from 'react'
import classnames from 'classnames'

import {isSourceArray, Source, Template} from 'models/widget/types'

// This is to avoid circular dependencies while doing recursion
import {widgetReference} from '../widgetReference'

type Props = {
    source: Source
    template: Template
    isParentList: boolean
}

export default function List({source, template, isParentList = false}: Props) {
    const SourceWidget = widgetReference.Widget

    if (!template.widgets || !template.widgets[0]) return null
    if (!isSourceArray(source)) return null

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
            {source.slice(0, 1).map((subSource, i) => {
                return (
                    <SourceWidget
                        key={i}
                        source={subSource}
                        parent={updatedTemplate}
                        template={passedTemplate}
                    />
                )
            })}
        </div>
    )
}
