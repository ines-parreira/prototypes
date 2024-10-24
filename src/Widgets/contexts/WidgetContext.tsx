import {Map} from 'immutable'
import React, {createContext, useMemo} from 'react'

import {STANDALONE_WIDGET_TYPE} from 'state/widgets/constants'
import {Widget, WidgetEnvironment} from 'state/widgets/types'

export const WidgetContext = createContext<Widget>({
    order: 0,
    type: STANDALONE_WIDGET_TYPE,
    context: WidgetEnvironment.Ticket,
    template: {},
    created_datetime: '',
    deactivated_datetime: null,
    id: 0,
    integration_id: null,
    app_id: null,
    updated_datetime: null,
    uri: '',
})

export const WidgetContextProvider = ({
    value,
    children,
}: {
    value: Map<string, any>
    children: React.ReactNode
}) => {
    const widget = useMemo(() => value.toJS() as Widget, [value])
    return (
        <WidgetContext.Provider value={widget}>
            {children}
        </WidgetContext.Provider>
    )
}
