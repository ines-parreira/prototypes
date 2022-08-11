import React from 'react'
import {Map} from 'immutable'
import classnames from 'classnames'

import SourceWidget from '../Widget'

type Props = {
    source: Map<string, unknown>
    widget: Map<string, unknown>
    template: Map<string, unknown>
    isParentList: boolean
}

export default function List({
    source,
    widget,
    template,
    isParentList = false,
}: Props) {
    const updatedTemplate = template.set(
        'absolutePath',
        (template.get('absolutePath') as string[]).concat(['[]'])
    )

    const passedTemplate = (
        updatedTemplate.getIn(['widgets', '0']) as Map<string, unknown>
    ).set(
        'templatePath',
        `${updatedTemplate.get('templatePath', '') as string}.widgets.0`
    )

    const className = classnames('list', {
        draggable: !isParentList,
    })

    return (
        <div className={className} data-key={template.get('path')}>
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
