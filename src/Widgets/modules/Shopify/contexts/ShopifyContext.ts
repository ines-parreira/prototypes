import {createContext} from 'react'

export type ShopifyContextType = {
    data_source: string | null
    widget_resource_ids: {
        target_id: number | null
        customer_id: number | null
    }
}

export const ShopifyContext = createContext<ShopifyContextType>({
    data_source: null,
    widget_resource_ids: {
        target_id: null,
        customer_id: null,
    },
})
