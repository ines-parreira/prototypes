import React, { useMemo } from 'react'

import type { Map } from 'immutable'

import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import { BundleInstallationMethod } from 'models/convert/bundle/types'
import { PreviewRadioButton } from 'pages/common/components/PreviewRadioButton'
import useThemeAppExtensionInstallation from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useThemeAppExtensionInstallation'
import { getIntegrationById } from 'state/integrations/selectors'

import css from './WizardInstallStep.less'

const HEADLESS_INSTRUCTIONS_URL =
    'https://developers.gorgias.com/docs/how-to-attach-gorgias-tracking-data-to-shopify-cart-and-checkout-attributes'

type Props = {
    integration: Map<any, any>
    isManualMethodRequired: boolean
    installationMethod: BundleInstallationMethod
    setInstallationMethod: (method: BundleInstallationMethod) => void
}

const WizardInstallStep = ({
    integration,
    isManualMethodRequired,
    installationMethod,
    setInstallationMethod,
}: Props) => {
    const storeIntegrationId = useMemo(() => {
        const id =
            !!integration &&
            (integration.getIn(['meta', 'shop_integration_id']) as number)

        return id || 0
    }, [integration])

    const storeIntegration = useAppSelector(
        getIntegrationById(storeIntegrationId),
    )

    const isConnectedToShopify = useMemo(
        () =>
            Boolean(
                storeIntegration &&
                    storeIntegration.get('type') === SHOPIFY_INTEGRATION_TYPE,
            ),
        [storeIntegration],
    )

    const { shouldUseThemeAppExtensionInstallation } =
        useThemeAppExtensionInstallation(
            isConnectedToShopify ? storeIntegration.toJS() : undefined,
        )

    const manualInstallationLabel = useMemo(() => {
        if (shouldUseThemeAppExtensionInstallation) {
            return 'Add the campaign bundle on your ecommerce store to display onsite campaigns.'
        }
        return 'Add the campaign bundle to non-Shopify stores, Shopify Headless, specific pages on a Shopify store, or any other website.'
    }, [shouldUseThemeAppExtensionInstallation])

    return (
        <div className={css.layout}>
            <h1 className={css.title}>Install the campaign bundle</h1>

            <div className={css.description}>
                Install the campaign bundle on your store to create and display
                campaigns.
            </div>

            {!shouldUseThemeAppExtensionInstallation && (
                <PreviewRadioButton
                    value="one-click"
                    isSelected={
                        installationMethod === BundleInstallationMethod.OneClick
                    }
                    isDisabled={isManualMethodRequired}
                    label="1-click installation for Shopify"
                    caption="Install the campaign bundle on your Shopify store in one click."
                    onClick={() => {
                        setInstallationMethod(BundleInstallationMethod.OneClick)
                    }}
                />
            )}
            <PreviewRadioButton
                value="manual"
                isSelected={
                    installationMethod === BundleInstallationMethod.Manual
                }
                className="mt-3"
                label="Manual installation"
                caption={manualInstallationLabel}
                onClick={() => {
                    setInstallationMethod(BundleInstallationMethod.Manual)
                }}
            />

            <div className={css.headless}>
                Is your store headless? In addition to the campaign bundle
                installation, to track conversions from campaigns, please follow{' '}
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={HEADLESS_INSTRUCTIONS_URL}
                >
                    these instructions
                </a>
                .
            </div>
        </div>
    )
}

export default WizardInstallStep
