import { convertLegacyPlanNameToPublicPlanName } from '@repo/billing-utils'
import classNames from 'classnames'
import { v4 as uuidv4 } from 'uuid'

import { Box, LegacyButton as Button } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentHelpdeskPlan } from 'state/billing/selectors'
import type { CustomSSOProviders } from 'state/currentAccount/types'

import CustomSsoProviderModal from './components/CustomSsoProviderModal'
import ProviderItem from './components/ProviderItem'
import { useCustomSsoProviderModalState } from './hooks'
import type { CustomSSOProviderData } from './types'

import css from './CustomProviderSso.less'

type CustomSsoProvidersProps = {
    accountDomain: string
    isLoading?: boolean
    onUpdate: (providers: CustomSSOProviders) => Promise<boolean>
    providers: CustomSSOProviders
    showModal: boolean
    setShowModal: (enabled: boolean) => void
}

const CustomSsoProviders = ({
    accountDomain,
    isLoading = false,
    onUpdate,
    providers = {},
    showModal,
    setShowModal,
}: CustomSsoProvidersProps) => {
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const currentPlanName = currentHelpdeskPlan
        ? convertLegacyPlanNameToPublicPlanName(currentHelpdeskPlan.name)
        : null

    // free plan is like enterprise but off the books, meaning it's used by our partners and gorgias employees
    const isAdvancedPlusCustomer = [
        'advanced',
        'enterprise',
        'custom',
        'free',
    ].some((priceType) => currentPlanName?.toLowerCase().includes(priceType))

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
        return onUpdate(newProviders)
    }

    const updateProvider = (
        providerId: string,
        providerData: CustomSSOProviderData,
    ) => {
        const newProviders = {
            ...providers,
            [providerId]: {
                name: providerData.name,
                client_id: providerData.clientId,
                client_secret: providerData.clientSecret,
                server_metadata_url: providerData.metadataUrl,
            },
        }
        return onUpdate(newProviders)
    }

    const handleSaveProvider = (
        providerData: CustomSSOProviderData,
        providerId?: string | null,
    ) => {
        if (providerId) {
            return updateProvider(providerId, providerData)
        }
        return createProvider(providerData)
    }

    const {
        modalMode,
        editingProviderId,
        editingProviderData,
        openCreateModal,
        openEditModal,
        handleSaveProvider: handleModalSave,
    } = useCustomSsoProviderModalState({
        showModal: showModal,
        setShowModal: setShowModal,
        onSave: handleSaveProvider,
    })

    const handleEditProvider = (providerId: string) => {
        const provider = providers[providerId]
        const providerData = {
            name: provider.name,
            clientId: provider.client_id,
            metadataUrl: provider.server_metadata_url,
        }
        openEditModal(providerId, providerData)
    }

    const handleDeleteProvider = (providerId: string) => {
        const { [providerId]: __deleted, ...remainingProviders } = providers
        onUpdate(remainingProviders)
    }

    const hideModal = () => {
        setShowModal(false)
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
                            disabled={isLoading}
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
                    onClose={hideModal}
                    onSave={handleModalSave}
                    isLoading={isLoading}
                />
            </Box>

            {isAdvancedPlusCustomer && (
                <Button
                    className={classNames({
                        [css.addProviderButton]: providerEntries.length > 0,
                    })}
                    fillStyle="fill"
                    intent="secondary"
                    isDisabled={!showModal && isLoading}
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
