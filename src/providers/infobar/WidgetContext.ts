import {createContext} from 'react'

type WidgetContextType = {
    data_source: string | null
    widget_resource_ids: {
        target_id: number | null
        customer_id: number | null
    }
}

export const WidgetContext = createContext<WidgetContextType>({
    data_source: null,
    widget_resource_ids: {
        target_id: null,
        customer_id: null,
    },
})
