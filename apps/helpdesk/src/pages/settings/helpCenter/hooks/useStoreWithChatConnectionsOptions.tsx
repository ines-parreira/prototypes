import React, { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import type {
    GorgiasChatIntegration,
    StoreIntegration,
} from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import type { Option } from 'pages/common/forms/SelectField/types'
import { getIconFromType } from 'state/integrations/helpers'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

export type CssClasses = {
    option: string
    icon: string
    connectedChatsCount: string
}

const optionLabel = (
    shopName: JSX.Element | string,
    shopType: IntegrationType,
    connectedChats: number,
    css: CssClasses,
) => {
    const connectedChatsString = `${connectedChats} connected chat${
        connectedChats > 1 ? 's' : ''
    }`

    return (
        <span className={css.option}>
            <span>
                <img
                    src={getIconFromType(shopType)}
                    className={css.icon}
                    alt="integration logo"
                />
            </span>

            <span>{shopName}</span>

            {connectedChats > 0 ? (
                <span className={css.connectedChatsCount}>
                    {connectedChatsString}
                </span>
            ) : null}
        </span>
    )
}

export function useStoreWithChatConnectionsOptions(css: CssClasses) {
    const eCommerceIntegrations: StoreIntegration[] = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ]),
    )

    const chatIntegrations = useAppSelector(
        getIntegrationsByTypes([IntegrationType.GorgiasChat]),
    )

    const shopsOptions: Option[] = useMemo(() => {
        const options = eCommerceIntegrations.map<Option>(
            (integration: StoreIntegration) => {
                const shopName: string = integration.name
                const shopType: IntegrationType = integration.type

                const connectedChats = chatIntegrations.filter(
                    (chat: GorgiasChatIntegration) => {
                        const chatShopName = chat.meta?.shop_name

                        return (
                            chatShopName ===
                            getShopNameFromStoreIntegration(integration)
                        )
                    },
                ).length

                return {
                    value: shopName,
                    label: optionLabel(shopName, shopType, connectedChats, css),
                    text: shopName,
                }
            },
        )
        return options
    }, [chatIntegrations, eCommerceIntegrations, css])

    return shopsOptions
}
