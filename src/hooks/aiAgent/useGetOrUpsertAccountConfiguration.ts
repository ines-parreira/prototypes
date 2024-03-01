import {useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {
    AccountConfiguration,
    StoreConfiguration,
} from '../../models/aiAgent/types'
import {
    useGetAccountConfiguration,
    useGetStoreConfigurationPure,
} from '../../models/aiAgent/queries'
import {notify} from '../../state/notifications/actions'
import {NotificationStatus} from '../../state/notifications/types'
import useAppDispatch from '../useAppDispatch'
import {useUpsertStoreConfiguration} from './useUpsertStoreConfiguration'
import {useUpsertAccountConfiguration} from './useUpsertAccountConfiguration'

export const useGetOrUpsertAiAgentConfiguration = (
    accountDomain: string,
    storeName: string,
    accountConfiguration: AccountConfiguration,
    storeConfiguration: StoreConfiguration
) => {
    const dispatch = useAppDispatch()
    const history = useHistory()

    const upsertAccountQuery = useUpsertAccountConfiguration()
    const getAccountQuery = useGetAccountConfiguration(accountDomain, {
        retry: 1,
    })
    const upsertStoreQuery = useUpsertStoreConfiguration(storeName, false)
    const getStoreQuery = useGetStoreConfigurationPure(
        {accountDomain, storeName},
        {retry: 1}
    )

    useEffect(() => {
        const upsertConfigurationsIfNeeded = async () => {
            if (
                !getAccountQuery.isFetched ||
                !getStoreQuery.isFetched ||
                upsertAccountQuery.isLoading ||
                upsertStoreQuery.isLoading ||
                upsertAccountQuery.isError ||
                upsertStoreQuery.isError
            )
                return

            if (getAccountQuery.isError) {
                await upsertAccountConfiguration()
            }

            if (getStoreQuery.isError) {
                await upsertStoreConfiguration()
            }
        }

        const upsertAccountConfiguration = async () => {
            try {
                await upsertAccountQuery.mutateAsync([accountConfiguration])
            } catch (error) {
                dispatchNotification('Failed to load AI Agent configuration')
                history.push('/app/automation')
            }
        }

        const upsertStoreConfiguration = async () => {
            try {
                await upsertStoreQuery.mutateAsync([
                    {accountDomain, storeName, storeConfiguration},
                ])
            } catch (error) {
                dispatchNotification('Failed to load AI Agent configuration')
                history.push('/app/automation')
            }
        }

        const dispatchNotification = (message: string) => {
            void dispatch(notify({message, status: NotificationStatus.Error}))
        }

        void upsertConfigurationsIfNeeded()
    }, [
        accountDomain,
        storeName,
        accountConfiguration,
        storeConfiguration,
        getAccountQuery.isFetched,
        getAccountQuery.isError,
        getStoreQuery.isFetched,
        getStoreQuery.isError,
        upsertAccountQuery.isLoading,
        upsertAccountQuery.isError,
        upsertAccountQuery.mutateAsync,
        upsertStoreQuery.isLoading,
        upsertStoreQuery.isError,
        upsertStoreQuery.mutateAsync,
        dispatch,
        upsertAccountQuery,
        upsertStoreQuery,
        history,
    ])

    return getStoreQuery
}
