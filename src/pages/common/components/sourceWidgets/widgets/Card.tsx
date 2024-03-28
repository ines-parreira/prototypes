import React from 'react'
import classnames from 'classnames'
import _last from 'lodash/last'

import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'
import {stripLastListsFromPath} from 'pages/common/components/infobar/utils'
import {Source, Template} from 'models/widget/types'

// This is to avoid circular dependencies while doing recursion
import {widgetReference} from '../widgetReference'
import css from './Card.less'

type Props = {
    source: Source
    template: Template
    isParentList: boolean
}

export default function Card({source, template, isParentList}: Props) {
    const SourceWidget = widgetReference.Widget
    const absolutePath = template.absolutePath || []
    const templatePath = template.templatePath || ''

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
                        {(template.widgets || []).map((childWidget, index) => {
                            if (typeof index !== 'number') return null
                            const passedTemplate = {
                                ...childWidget,
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
            </div>
        </div>
    )
}
