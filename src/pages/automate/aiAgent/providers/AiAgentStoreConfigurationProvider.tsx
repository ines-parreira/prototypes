import React, {ReactNode, useCallback, useEffect} from 'react'
import {useParams} from 'react-router-dom'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {
    CreateStoreConfigurationPayload,
    StoreConfiguration,
} from 'models/aiAgent/types'
import {useStoreConfiguration} from '../hooks/useStoreConfiguration'
import {useStoreConfigurationMutation} from '../hooks/useStoreConfigurationMutation'
import AiAgentStoreConfigurationContext from './AiAgentStoreConfigurationContext'

type Props = {
    children: ReactNode
}

const AiAgentStoreConfigurationProvider = ({children}: Props) => {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const {storeConfiguration: fetchedStoreConfiguration, isLoading} =
        useStoreConfiguration({
            shopName,
            accountDomain,
        })

    const [storeConfiguration, setStoreConfiguration] = React.useState<
        StoreConfiguration | undefined
    >(undefined)

    useEffect(() => {
        if (
            !isLoading &&
            fetchedStoreConfiguration !== undefined &&
            storeConfiguration === undefined
        ) {
            setStoreConfiguration(fetchedStoreConfiguration)
        }
    }, [fetchedStoreConfiguration, storeConfiguration, isLoading])

    const {
        isLoading: isPendingCreateOrUpdate,
        createStoreConfiguration: createStoreConfigurationMutation,
        upsertStoreConfiguration: upsertStoreConfigurationMutation,
    } = useStoreConfigurationMutation({shopName, accountDomain})

    const createStoreConfiguration = useCallback(
        async (configurationToSubmit: CreateStoreConfigurationPayload) => {
            const createdConfiguration = await createStoreConfigurationMutation(
                configurationToSubmit
            )

            setStoreConfiguration(createdConfiguration)
        },
        [createStoreConfigurationMutation]
    )

    const updateStoreConfiguration = useCallback(
        async (configurationToSubmit: StoreConfiguration) => {
            const updatedConfiguration = await upsertStoreConfigurationMutation(
                configurationToSubmit
            )

            setStoreConfiguration(updatedConfiguration)
        },
        [upsertStoreConfigurationMutation]
    )

    return (
        <AiAgentStoreConfigurationContext.Provider
            value={{
                storeConfiguration,
                createStoreConfiguration,
                updateStoreConfiguration,
                isLoading,
                isPendingCreateOrUpdate,
            }}
        >
            {children}
        </AiAgentStoreConfigurationContext.Provider>
    )
}

export default AiAgentStoreConfigurationProvider
