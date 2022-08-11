import React from 'react'
import {fromJS, List, Map} from 'immutable'

import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'

import css from './Widgets.less'
import Widget from './Widget'

type Props = {
    source: Map<string, unknown>
    widgets: List<Map<string, unknown>>
}

export default function Widgets({source, widgets}: Props) {
    return (
        <DragWrapper
            group={{
                name: 'root',
                pull: true,
                put: false,
            }}
            isEditing
            tag={null}
        >
            <div className={css.sourceWidgetList}>
                {widgets.map((widget, i) => {
                    if (!widget || typeof i !== 'number') return null
                    let passedTemplate = (
                        widget.get('template', fromJS({})) as Map<
                            string,
                            unknown
                        >
                    ).set(
                        'templatePath',
                        `${(widget.get('order') as number).toString()}.template`
                    )

                    const sourcePath = widget.get('sourcePath')
                    passedTemplate = passedTemplate.set('path', sourcePath)

                    return (
                        <Widget
                            key={`${
                                passedTemplate.get('path') as string
                            }-${i.toString()}`}
                            source={source}
                            widget={widget}
                            template={passedTemplate}
                            parent={widget}
                        />
                    )
                })}
            </div>
        </DragWrapper>
    )
}
