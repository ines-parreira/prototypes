import React, {FunctionComponent} from 'react'
import {Map} from 'immutable'

import {Template} from 'models/widget/types'

export type WidgetProps = {
    parent?: Template
    source: Map<string, unknown>
    template: Template
}

// This is to avoid circular dependencies while doing recursion
export const widgetReference: {
    Widget: FunctionComponent<WidgetProps>
} = {
    Widget: () => <></>,
}
