import React, {FunctionComponent} from 'react'

import {Source, Template} from 'models/widget/types'

export type WidgetProps = {
    parent?: Template
    source: Source
    template: Template
}

// This is to avoid circular dependencies while doing recursion
export const widgetReference: {
    Widget: FunctionComponent<WidgetProps>
} = {
    Widget: () => <></>,
}
