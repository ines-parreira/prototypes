import React from 'react'
import {Map} from 'immutable'

import {Source, Template as TemplateType} from 'models/widget/types'
import {WidgetType} from 'state/widgets/types'
import Template from 'Infobar/features/Template'
import {getWidgetByType} from 'Infobar/features/Widget/helper/getWidgetByType'
import {WidgetContextProvider} from 'Infobar/features/Widget/contexts/WidgetContext'
import Placeholder from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/Placeholder'

// This is where we remove immutable and start using plain JS objects for now
export default function Widget({
    isEditing,
    type,
    source,
    absolutePath,
    template,
    widget,
    index,
}: {
    isEditing: boolean
    index: number
    widget: Map<string, unknown>
    template: Map<string, unknown>
    absolutePath: string
    source?: Map<string, unknown>
    type: 'placeholder' | undefined
}) {
    // Beware we want to assign `templatePath`
    // AFTER having sorted the results by `widget.order` in parent component
    const passedTemplate = {
        ...(template.toJS() as TemplateType),
        templatePath: `${index}.template`,
        absolutePath: JSON.parse(absolutePath) as (number | string)[],
    }

    const SpecificWidget = getWidgetByType(widget.get('type') as WidgetType)
    const widgetProps = {
        source: source?.toJS() as Source,
        template: passedTemplate,
    }

    return (
        <WidgetContextProvider value={widget}>
            {type === 'placeholder' ? (
                <Placeholder isEditing={isEditing} template={passedTemplate} />
            ) : SpecificWidget ? (
                <SpecificWidget {...widgetProps} />
            ) : (
                <Template {...widgetProps} />
            )}
        </WidgetContextProvider>
    )
}
