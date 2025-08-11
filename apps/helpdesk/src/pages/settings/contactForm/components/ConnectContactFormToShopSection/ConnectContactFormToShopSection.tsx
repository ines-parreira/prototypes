import React, { useState } from 'react'

import classNames from 'classnames'

import { Label } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import SelectStore, {
    HelpCenterContactFormIntegrationTypes,
} from 'pages/settings/common/SelectStore/SelectStore'
import settingsCss from 'pages/settings/settings.less'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

import contactFormCss from '../../contactForm.less'
import css from './ConnectContactFormToShopSection.less'

interface Props {
    onUpdate: (data: {
        shop_name: string | null
        shop_integration_id: number | null
    }) => void
    shopName: string | null
    shopIntegrationId: number | null
}

export const ConnectContactFormToShopSection = ({
    shopName,
    shopIntegrationId,
    onUpdate,
}: Props): JSX.Element | null => {
    const [selectedShop, setSelectedShop] = useState({
        shopName,
        shopIntegrationId,
    })
    const gorgiasChatIntegrations = useAppSelector(
        getIntegrationsByTypes([IntegrationType.GorgiasChat]),
    )
    return (
        <section className={settingsCss.mb40}>
            <Label htmlFor="store-select" className={contactFormCss.mbXxs}>
                Connect a store
            </Label>
            <p
                className={classNames(
                    'body-regular',
                    css.description,
                    settingsCss.mb8,
                )}
            >
                A store connection is required to use AI Agent features and
                enable auto-embedding for Shopify stores.
            </p>

            <SelectStore
                isDisabled={!!(shopName || shopIntegrationId)}
                handleStoreChange={(
                    integration: HelpCenterContactFormIntegrationTypes,
                ) => {
                    setSelectedShop({
                        shopName: integration.name,
                        shopIntegrationId: integration.id,
                    })
                    onUpdate({
                        shop_name: integration.name,
                        shop_integration_id: integration.id,
                    })
                }}
                shopName={selectedShop.shopName}
                shopIntegrationId={selectedShop.shopIntegrationId}
                gorgiasChatIntegrations={gorgiasChatIntegrations}
            />
        </section>
    )
}
