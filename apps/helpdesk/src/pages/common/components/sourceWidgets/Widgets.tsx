import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'

import type { Source, Template } from 'models/widget/types'
import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'
import { WidgetContextProvider } from 'Widgets/contexts/WidgetContext'

import Widget from './Widget'

import css from './Widgets.less'

type Props = {
    source: Map<string, unknown>
    widgets: Map<string, unknown>[]
}

export default function Widgets({ source, widgets }: Props) {
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
                    const template: Template = (
                        widget.get('template', fromJS({})) as Map<
                            string,
                            unknown
                        >
                    ).toJS()

                    template.templatePath = `${(
                        widget.get('order') as number
                    ).toString()}.template`
                    template.absolutePath = sourcePath

                    return (
                        <WidgetContextProvider
                            key={`${sourcePath.join('-')}-${i.toString()}`}
                            value={widget}
                        >
                            <Widget
                                source={
                                    (
                                        source.getIn(sourcePath, source) as Map<
                                            string,
                                            unknown
                                        >
                                    ).toJS() as Source
                                }
                                template={template}
                            />
                        </WidgetContextProvider>
                    )
                })}
            </div>
        </DragWrapper>
    )
}
