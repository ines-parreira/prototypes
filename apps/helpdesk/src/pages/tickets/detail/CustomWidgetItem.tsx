import type { Map } from 'immutable'

import type { Source, Template as TemplateType } from 'models/widget/types'
import { STANDALONE_WIDGET_TYPE } from 'state/widgets/constants'
import { getWidgetSourcePath } from 'state/widgets/utils'
import { WidgetContextProvider } from 'Widgets/contexts/WidgetContext'
import { Template } from 'Widgets/modules/Template'

type Props = {
    widget: Map<string, unknown>
    sources: Map<string, unknown>
    widgetIndex: number
    fallbackIndex: number
}

export function CustomWidgetItem({
    widget,
    sources,
    widgetIndex,
    fallbackIndex,
}: Props) {
    const sourcePath = getWidgetSourcePath(widget, sources)
    if (!sourcePath) return null

    const template = widget.get('template') as Map<string, unknown>
    const passedTemplate = {
        ...(template.toJS() as TemplateType),
        templatePath: `${widgetIndex >= 0 ? widgetIndex : fallbackIndex}.template`,
        absolutePath: sourcePath,
    }

    const source =
        sourcePath.length > 0
            ? (sources.getIn(sourcePath) as Map<string, unknown> | undefined)
            : undefined

    const widgetType = widget.get('type') as string
    if (widgetType !== STANDALONE_WIDGET_TYPE && !source) {
        return null
    }

    return (
        <WidgetContextProvider value={widget}>
            <Template
                source={source?.toJS() as Source}
                template={passedTemplate}
            />
        </WidgetContextProvider>
    )
}
