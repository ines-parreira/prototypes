import { FeatureFlagKey } from '@repo/feature-flags'
import classNames from 'classnames'
import { v4 as uuidv4 } from 'uuid'

import { Box, Button } from '@gorgias/axiom'

import { useFlag } from 'core/flags'
import { CustomSSOProviders } from 'state/currentAccount/types'

import CustomSsoProviderModal from './components/CustomSsoProviderModal'
import ProviderItem from './components/ProviderItem'
import { useCustomSsoProviderModalState } from './hooks'
import type { CustomSSOProviderData } from './types'

import css from './CustomProviderSso.less'

type CustomSsoProvidersProps = {
    accountDomain: string
    disabled?: boolean
    onUpdate: (providers: CustomSSOProviders) => void
    providers: CustomSSOProviders
}

const CustomSsoProviders = ({
    accountDomain,
    disabled = false,
    onUpdate,
    providers = {},
}: CustomSsoProvidersProps) => {
    const isCustomSSOEnabled = useFlag(FeatureFlagKey.CustomSso)

    const createProvider = (providerData: CustomSSOProviderData) => {
        const newProviderId = uuidv4()
        const newProviders = {
            ...providers,
            [newProviderId]: {
                name: providerData.name,
                client_id: providerData.clientId,
                client_secret: providerData.clientSecret,
                server_metadata_url: providerData.metadataUrl,
            },
        }
        onUpdate(newProviders)
    }

    const updateProvider = (
        providerId: string,
        providerData: CustomSSOProviderData,
    ) => {
        const existingProvider = providers[providerId]
        const newProviders = {
            ...providers,
            [providerId]: {
                name: providerData.name,
                client_id: providerData.clientId,
                client_secret:
                    providerData.clientSecret || existingProvider.client_secret,
                server_metadata_url: providerData.metadataUrl,
            },
        }
        onUpdate(newProviders)
    }

    const handleSaveProvider = (
        providerData: CustomSSOProviderData,
        providerId?: string | null,
    ) => {
        if (providerId) {
            updateProvider(providerId, providerData)
        } else {
            createProvider(providerData)
        }
    }

    const {
        showModal,
        modalMode,
        editingProviderId,
        editingProviderData,
        openCreateModal,
        openEditModal,
        closeModal,
        handleSaveProvider: handleModalSave,
    } = useCustomSsoProviderModalState({
        onSave: handleSaveProvider,
    })

    const handleEditProvider = (providerId: string) => {
        const provider = providers[providerId]
        const providerData = {
            name: provider.name,
            clientId: provider.client_id,
            clientSecret: provider.client_secret,
            metadataUrl: provider.server_metadata_url,
        }
        openEditModal(providerId, providerData)
    }

    const handleDeleteProvider = (providerId: string) => {
        const { [providerId]: __deleted, ...remainingProviders } = providers
        onUpdate(remainingProviders)
    }

    const providerEntries = Object.entries(providers || {})

    return (
        <>
            <Box className="mt-4" flexDirection="column">
                {providerEntries.length > 0 && (
                    <h6 className={css.section}>Custom Identity Providers</h6>
                )}

                <Box flexDirection="column">
                    {providerEntries.map(([providerId, provider]) => (
                        <ProviderItem
                            disabled={disabled}
                            key={providerId}
                            onDelete={handleDeleteProvider}
                            onEdit={handleEditProvider}
                            providerId={providerId}
                            providerName={provider?.name}
                        />
                    ))}
                </Box>

                <CustomSsoProviderModal
                    accountDomain={accountDomain}
                    editingProviderId={editingProviderId}
                    initialData={editingProviderData}
                    isOpen={showModal}
                    mode={modalMode}
                    onClose={closeModal}
                    onSave={handleModalSave}
                />
            </Box>

            {isCustomSSOEnabled && (
                <Button
                    className={classNames({
                        [css.addProviderButton]: providerEntries.length > 0,
                    })}
                    fillStyle="fill"
                    intent="secondary"
                    isDisabled={disabled}
                    onClick={openCreateModal}
                    size="small"
                >
                    + Add provider
                </Button>
            )}
        </>
    )
}

export default CustomSsoProviders
