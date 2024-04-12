import React from 'react'
import {Map} from 'immutable'

import {Source, Template as TemplateType} from 'models/widget/types'
import Template from 'Infobar/features/Template'

import {WidgetContextProvider} from './WidgetContext'
import Placeholder from './widgets/Placeholder'

// This is where we remove immutable and start using plain JS objects for now
export const Widget = ({
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
}) => {
    // Beware we want to assign `templatePath`
    // AFTER having sorted the results by `widget.order` in parent component
    const passedTemplate = {
        ...(template.toJS() as TemplateType),
        templatePath: `${index}.template`,
        absolutePath: JSON.parse(absolutePath) as (number | string)[],
    }

    if (type === 'placeholder') {
        return (
            <WidgetContextProvider value={widget}>
                <Placeholder isEditing={isEditing} template={passedTemplate} />
            </WidgetContextProvider>
        )
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
