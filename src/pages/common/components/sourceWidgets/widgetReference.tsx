import React, {FunctionComponent} from 'react'

import {Map} from 'immutable'

export type WidgetProps = {
    parent: Map<string, unknown>
    source: Map<string, unknown>
    widget: Map<string, unknown>
    template: Map<any, any>
}

// This is to avoid circular dependencies while doing recursion
export const widgetReference: {
    Widget: FunctionComponent<WidgetProps>
} = {
    Widget: () => <></>,
}
