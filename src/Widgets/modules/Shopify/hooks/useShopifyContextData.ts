import {useMemo} from 'react'

import {Source, isSourceRecord} from 'models/widget/types'

import {defaultShopifyContextValue} from '../contexts/ShopifyContext'

export function useShopifyContextData(source: Source) {
    return useMemo(() => {
        const contextData = {
            ...defaultShopifyContextValue,
        }
        /*
                Provide proper context to children
                For Shopify widget :
                - data_source is either Customer or Order
                - widget_resource_ids always has shopify customer_id because we need it for tracking and
                target_id is either a customer_id or an order_id depending of the Shopify card targeted
                (an Order or a Customer). target_id maybe is equal to customer_id in Shopify customer card
            */

        if (!isSourceRecord(source)) return contextData

        const data_source_endpoint =
            typeof source.admin_graphql_api_id === 'string'
                ? source.admin_graphql_api_id
                : ''

        if (!data_source_endpoint) return contextData

        const reg = new RegExp(/gid:\/\/shopify\/(?<type>\w+)\/[0-9]+/g)
        const match = reg.exec(data_source_endpoint)

        //extract the type Customer or Order from data_source_endpoint
        if (match?.length === 2) contextData.data_source = match[1]

        contextData.widget_resource_ids = {
            target_id: typeof source.id === 'number' ? source.id : null,
            customer_id:
                (isSourceRecord(source.customer) &&
                    (source.customer.id as number)) ||
                null,
        }

        return contextData
    }, [source])
}
