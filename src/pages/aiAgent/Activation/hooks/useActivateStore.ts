import cloneDeep from 'lodash/cloneDeep'

import useAppSelector from 'hooks/useAppSelector'
import { State } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { useStoresConfigurationMutation } from 'pages/aiAgent/hooks/useStoresConfigurationMutation'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

export const useActivateStore = ({
    isLoading,
    state,
}: {
    isLoading: boolean
    state: State
}) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const { isLoading: isSaveLoading, upsertStoresConfiguration } =
        useStoresConfigurationMutation({ accountDomain })

    return ({ shopName }: { shopName?: string | null }) => {
        const canActivate = () => {
            if (!shopName || !state[shopName] || isLoading) {
                return { isLoading: true, isDisabled: true }
            }

            const storeActivation = state[shopName]
            const isDisabled =
                storeActivation.alerts.length > 0 ||
                (!!storeActivation.support.chat.isInstallationMissing &&
                    !!storeActivation.support.chat.isIntegrationMissing &&
                    !!storeActivation.support.email.isIntegrationMissing)

            return {
                isLoading: false,
                isDisabled,
            }
        }

        const activate = async (onSuccess?: () => void) => {
            if (!shopName || !state[shopName] || canActivate().isDisabled) {
                return
            }

            const storeActivation = state[shopName]
            const newStoreConfiguration = cloneDeep(
                storeActivation.configuration,
            )

            if (!storeActivation.support.email.isIntegrationMissing) {
                newStoreConfiguration.emailChannelDeactivatedDatetime = null
            }

            if (
                !storeActivation.support.chat.isIntegrationMissing &&
                !storeActivation.support.chat.isInstallationMissing
            ) {
                newStoreConfiguration.chatChannelDeactivatedDatetime = null
            }

            await upsertStoresConfiguration([newStoreConfiguration])
            onSuccess?.()
        }

        return {
            canActivate,
            activate,
            isActivating: isSaveLoading,
        }
    }
}
