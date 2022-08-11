import React from 'react'
import {fromJS, List, Map} from 'immutable'
import classnames from 'classnames'
import _last from 'lodash/last'

import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'
import {stripLastListsFromPath} from 'pages/common/components/infobar/utils'

import SourceWidget from '../Widget'
import css from './Card.less'

type Props = {
    source: Map<string, unknown>
    widget: Map<string, unknown>
    template: Map<string, unknown>
    isParentList: boolean
}

export default function Card({source, widget, template, isParentList}: Props) {
    const absolutePath = template.get('absolutePath') as string[]
    const templatePath = template.get('templatePath') as string

    let displayedTitle = stripLastListsFromPath(absolutePath)
    displayedTitle = _last(displayedTitle) || ''

    return (
        <div
            className={classnames(css.sourceWidgetCard, {
                draggable: !isParentList,
            })}
            data-key={template.get('path')}
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
                        {(
                            template.get('widgets', fromJS([])) as List<
                                Map<string, unknown>
                            >
                        ).map((childWidget, index) => {
                            if (typeof index !== 'number') return null
                            const passedTemplate = (
                                childWidget as Map<string, unknown>
                            ).set(
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
        </div>
    )
}
