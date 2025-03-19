import classnames from 'classnames'
import _last from 'lodash/last'

import { Source, Template } from 'models/widget/types'
import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'
import { stripLastListsFromPath } from 'pages/common/components/infobar/utils'

import css from './Card.less'

type Props = {
    source: Source
    template: Template
    isParentList: boolean
    children: React.ReactNode
}

export default function Card({ template, isParentList, children }: Props) {
    const absolutePath = template.absolutePath || []

    let displayedTitle = stripLastListsFromPath(absolutePath)
    displayedTitle = _last(displayedTitle) || ''

    return (
        <div
            className={classnames(css.sourceWidgetCard, {
                draggable: !isParentList,
            })}
            data-key={template.path}
        >
            <div className={css.sourceWidgetCardMarginWrapper}>
                <div className={css.sourceWidgetCardHeader}>
                    {displayedTitle}
                    {isParentList && <span> (list)</span>}
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
                        {children}
                    </DragWrapper>
                </div>
            </div>
        </div>
    )
}
