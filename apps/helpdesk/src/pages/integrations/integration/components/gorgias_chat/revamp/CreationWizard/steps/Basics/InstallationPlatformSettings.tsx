import { Radio, RadioGroup, Text } from '@gorgias/axiom'

import type {
    GorgiasChatIntegration,
    StoreIntegration,
} from 'models/integration/types'
import { StorePicker } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/StorePicker'

import css from './GorgiasChatCreationWizardStepBasics.less'

type InstallationPlatformSettingsProps = {
    isStoreRequired: boolean
    onInstallationPlatformChange: (value: string) => void
    storeIntegration: StoreIntegration | false | undefined
    gorgiasChatIntegrations: GorgiasChatIntegration[]
    storeIntegrations: StoreIntegration[]
    onStoreChange: (storeIntegrationId: number) => void
    hasStoreError: boolean
    isStoreOfShopifyType: boolean | undefined
    hasShopifyScriptTagScope: boolean | undefined
    retriggerOAuthFlow: () => void
}

export const InstallationPlatformSettings = ({
    isStoreRequired,
    onInstallationPlatformChange,
    storeIntegration,
    gorgiasChatIntegrations,
    storeIntegrations,
    onStoreChange,
    hasStoreError,
    isStoreOfShopifyType,
    hasShopifyScriptTagScope,
    retriggerOAuthFlow,
}: InstallationPlatformSettingsProps) => {
    return (
        <div>
            <Text
                variant="bold"
                size="md"
                className={css.platformSelectionHeading}
            >
                Choose where you&apos;ll install your chat
            </Text>
            <RadioGroup
                value={
                    isStoreRequired
                        ? 'ecommerce-platforms'
                        : 'any-other-website'
                }
                onChange={onInstallationPlatformChange}
                flexDirection="column"
                gap="xs"
                marginBottom="md"
            >
                <Radio
                    value="ecommerce-platforms"
                    label="Ecommerce platforms"
                    caption="Shopify, Magento, BigCommerce"
                />
                <Radio
                    value="any-other-website"
                    label="Any other website"
                    caption="Websites, knowledge bases, etc."
                />
            </RadioGroup>
            {isStoreRequired && (
                <>
                    <StorePicker
                        selectedStoreIntegrationId={
                            storeIntegration ? storeIntegration.id : null
                        }
                        gorgiasChatIntegrations={gorgiasChatIntegrations}
                        storeIntegrations={storeIntegrations}
                        onChange={onStoreChange}
                        error={
                            hasStoreError
                                ? 'This field is required.'
                                : undefined
                        }
                        size="sm"
                    />

                    {storeIntegration &&
                        isStoreOfShopifyType &&
                        !hasShopifyScriptTagScope && (
                            <div
                                className={css.info}
                                data-testid="has-shopify-script-tag-scope"
                            >
                                Please{' '}
                                <a onClick={retriggerOAuthFlow} href="#">
                                    update Shopify permissions
                                </a>{' '}
                                to ensure better chat stability. Your progress
                                on this page will be saved.
                            </div>
                        )}
                </>
            )}
        </div>
    )
}
