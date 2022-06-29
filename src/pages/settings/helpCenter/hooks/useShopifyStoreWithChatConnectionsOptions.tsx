import React, {useMemo} from 'react'
import {Map} from 'immutable'

import shopify from 'assets/img/integrations/shopify.png'

import {IntegrationType} from 'models/integration/types'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {Option} from 'pages/common/forms/SelectField/types'
import useAppSelector from 'hooks/useAppSelector'

type CssClasses = {
    option: string
    icon: string
    connectedChatsCount: string
}

const optionLabel = (
    shop: JSX.Element | string,
    connectedChats = 0,
    css: CssClasses
) => (
    <span className={css.option}>
        <span>
            <img src={shopify} className={css.icon} alt="shopify logo" />
        </span>

        <span>{shop}</span>

        {connectedChats > 0 ? (
            <span className={css.connectedChatsCount}>
                {connectedChats} connected chat{connectedChats > 1 ? 's' : null}
            </span>
        ) : null}
    </span>
)

export function useShopifyStoreWithChatConnectionsOptions(css: CssClasses) {
    const shopifyIntegrations = useAppSelector(
        getIntegrationsByTypes(IntegrationType.Shopify)
    )

    const chatIntegrations = useAppSelector(
        getIntegrationsByTypes(IntegrationType.GorgiasChat)
    )

    const shopsOptions: Option[] = useMemo(() => {
        const options = shopifyIntegrations
            .valueSeq()
            .map<Option>((integration: Map<any, any>) => {
                const shopName: string = integration.getIn([
                    'meta',
                    'shop_name',
                ])

                const connectedChats = chatIntegrations
                    .toArray()
                    .filter((chat: Map<any, any>) => {
                        const chatShopName: string | undefined = chat.getIn(
                            ['meta', 'shop_name'],
                            undefined
                        )

                        return chatShopName === shopName
                    }).length

                return {
                    value: shopName,
                    label: optionLabel(shopName, connectedChats, css),
                    text: shopName,
                }
            })
            .toArray()
        return options
    }, [chatIntegrations, shopifyIntegrations, css])

    return shopsOptions
}
