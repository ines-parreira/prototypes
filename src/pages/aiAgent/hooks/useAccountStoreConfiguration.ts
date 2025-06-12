import { useGetOrCreateAccountConfiguration } from 'hooks/aiAgent/useGetOrCreateAccountConfiguration'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

export const useAccountStoreConfiguration = ({
    storeNames,
}: {
    storeNames: string[]
}) => {
    const currentAccount = useAppSelector(getCurrentAccountState)

    const accountId = currentAccount.get('id')
    const accountDomain = currentAccount.get('domain')
    const { data: accountConfigData } = useGetOrCreateAccountConfiguration(
        { accountId, accountDomain, storeNames },
        { refetchOnWindowFocus: false },
    )

    const accountConfiguration = accountConfigData?.data.accountConfiguration
    return {
        accountConfiguration,
        aiAgentTicketViewId: accountConfiguration?.views?.['All']?.id || null,
        aiAgentPreviewTicketViewId:
            accountConfiguration?.views?.['Preview']?.id || null,
    }
}
