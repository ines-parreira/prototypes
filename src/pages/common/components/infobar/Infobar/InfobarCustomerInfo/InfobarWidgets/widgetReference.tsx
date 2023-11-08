import React, {FunctionComponent} from 'react'

import {Map} from 'immutable'

export type WidgetProps = {
    parent?: Map<any, any>
    source?: Maybe<Map<string, unknown>>
    widget: Map<string, unknown>
    template: Map<unknown, unknown>
    open?: boolean
    removeBorderTop?: boolean
}

// This is to avoid circular dependencies while doing recursion
export const widgetReference: {
    Widget: FunctionComponent<WidgetProps>
} = {
    Widget: () => <></>,
}
