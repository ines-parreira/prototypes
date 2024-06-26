import React, {useEffect, useState} from 'react'

import classNames from 'classnames'
import {Label} from '@gorgias/ui-kit'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import {useShopifyStoreWithChatConnectionsOptions} from 'pages/settings/helpCenter/hooks/useShopifyStoreWithChatConnectionsOptions'
import settingsCss from 'pages/settings/settings.less'

import contactFormCss from '../../contactForm.less'
import css from './ConnectContactFormToShopSection.less'

interface Props {
    onUpdate: (data: {shop_name: string | null}) => void
    shopName: string | null
}

export const ConnectContactFormToShopSection = ({
    shopName,
    onUpdate,
}: Props): JSX.Element | null => {
    const [selectedShop, setSelectedShop] = useState(shopName)

    useEffect(() => {
        setSelectedShop(shopName)
    }, [shopName])

    const shopifyShopsOptions = useShopifyStoreWithChatConnectionsOptions({
        option: css['select-option'],
        icon: css['shopify-icon'],
        connectedChatsCount: css['select-connected-chats'],
    })

    return (
        <section className={settingsCss.mb40}>
            <Label htmlFor="store-select" className={contactFormCss.mbXxs}>
                Connect a store
            </Label>
            <p
                className={classNames(
                    'body-regular',
                    css.description,
                    settingsCss.mb8
                )}
            >
                A store connection is required to use Automate features and
                enable auto-embedding for Shopify stores.
            </p>

            <SelectField
                disabled={!!shopName}
                value={selectedShop}
                fullWidth
                id="store-select"
                placeholder="Select a store"
                icon={selectedShop ? undefined : 'store'}
                onChange={(value) => {
                    // this type cast is safe as all values are string
                    setSelectedShop(value as string)
                    onUpdate({shop_name: value as string})
                }}
                caption="Once set, the store associated with this contact form cannot be changed."
                options={shopifyShopsOptions}
            />
        </section>
    )
}
