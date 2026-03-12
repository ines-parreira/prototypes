import { Box, Icon, Label, Tag } from '@gorgias/axiom'

import type { StoreIntegration } from 'models/integration/types'
import { DropdownSelector } from 'pages/aiAgent/Onboarding_V2/components/DropdownSelector/DropdownSelector'
import { IntegrationCard } from 'pages/aiAgent/Onboarding_V2/components/IntegrationCard/IntegrationCard'
import css from 'pages/aiAgent/Onboarding_V2/components/steps/ShopifyIntegrationStep/ShopifyIntegrationStep.less'

type ShopifyStoreSelectorProps = {
    availableStores: StoreIntegration[]
    allStores: StoreIntegration[]
    selectedStore: StoreIntegration | undefined
    selectedShop: string | undefined
    onSelectStore: (shopId: number | null) => void
    onConnect: () => void
    isLoading: boolean
}

export const ShopifyStoreSelector = ({
    availableStores,
    allStores,
    selectedStore,
    selectedShop,
    onSelectStore,
    onConnect,
    isLoading,
}: ShopifyStoreSelectorProps) => {
    return (
        <IntegrationCard
            icon={<Icon name="app-shopify" size="lg" />}
            title="Connect Shopify"
            description="Empower your AI Agent with access to customer orders and data, enabling it to answer questions and perform actions seamlessly."
            status={
                selectedShop ? (
                    <Tag color="green">Connected</Tag>
                ) : (
                    <Tag color="grey">Disconnected</Tag>
                )
            }
            buttonLabel={allStores.length === 0 ? 'Connect' : undefined}
            onClick={onConnect}
        >
            {!isLoading && (
                <Box flexDirection="column" gap="sm" paddingTop="sm">
                    {availableStores.length > 0 && selectedStore ? (
                        <DropdownSelector
                            items={availableStores}
                            selectedKey={selectedStore.id}
                            setSelectedKey={onSelectStore}
                            selectedItem={selectedStore}
                            getItemKey={(item: StoreIntegration) => item.id}
                            getItemLabel={(item: StoreIntegration) => item.name}
                        />
                    ) : (
                        <Label isInvalid>
                            All your stores have an Ai Agent configured already.
                        </Label>
                    )}
                    <a className={css.link} onClick={onConnect}>
                        Need to create a new store? Click here
                    </a>
                </Box>
            )}
        </IntegrationCard>
    )
}
