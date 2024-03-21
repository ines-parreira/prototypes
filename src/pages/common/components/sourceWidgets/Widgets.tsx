import React from 'react'
import {fromJS, List, Map} from 'immutable'

import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'
import {Template} from 'models/widget/types'

import css from './Widgets.less'
import Widget from './Widget'
import {widgetReference} from './widgetReference'

type Props = {
    source: Map<string, unknown>
    widgets: List<Map<string, unknown>>
}

// This is to avoid circular dependencies while doing recursion
widgetReference.Widget = Widget

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
                    const sourcePath = (
                        widget.get('sourcePath') as List<any>
                    ).toJS() as string[]
                    const passedTemplate: Template = (
                        widget.get('template', fromJS({})) as Map<
                            string,
                            unknown
                        >
                    ).toJS()

                    passedTemplate.templatePath = `${(
                        widget.get('order') as number
                    ).toString()}.template`
                    passedTemplate.absolutePath = sourcePath

                    return (
                        <Widget
                            key={`${sourcePath.join('-')}-${i.toString()}`}
                            source={source.getIn(sourcePath, source)}
                            widget={widget}
                            template={passedTemplate}
                        />
                    )
                })}
            </div>
        </DragWrapper>
    )
}
