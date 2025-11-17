import classnames from 'classnames'

import type { Source, Template } from 'models/widget/types'
import { isSourceArray } from 'models/widget/types'

type Props = {
    source: Source
    template: Template
    isParentList: boolean
    children: (child: Source, index: number) => React.ReactNode
}

export default function List({
    source,
    template,
    isParentList = false,
    children,
}: Props) {
    if (!template.widgets || !template.widgets[0]) return null
    if (!isSourceArray(source)) return null

    const className = classnames('list', {
        draggable: !isParentList,
    })

    return (
        <div className={className} data-key={template.path}>
            {source
                .slice(0, 1)
                .map((childSource, index) => children(childSource, index))}
        </div>
    )
}
