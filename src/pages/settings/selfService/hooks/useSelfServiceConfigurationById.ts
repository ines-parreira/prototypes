import {useEffect, useState} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import {fetchSelfServiceConfiguration} from 'models/selfServiceConfiguration/resources'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {selfServiceConfigurationFetched} from 'state/entities/selfServiceConfigurations/actions'
import {getSelfServiceConfigurations} from 'state/entities/selfServiceConfigurations/selectors'

export const useSelfServiceConfigurationById = (
    integrationId: number | null,
    shopName: string | null
) => {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(true)
    const configurations = useAppSelector(getSelfServiceConfigurations)

    useEffect(() => {
        const foundConfigurationIndex = configurations.findIndex(
            (configuration) => configuration.shop_name === shopName
        )

        if (!integrationId) {
            return
        }

        if (foundConfigurationIndex === -1) {
            void (async () => {
                try {
                    const res = await fetchSelfServiceConfiguration(
                        integrationId.toString()
                    )
                    void dispatch(selfServiceConfigurationFetched(res))
                    setIsLoading(false)
                } catch (error) {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message:
                                'Could not fetch the Self-service configuration, please try again later.',
                        })
                    )
                } finally {
                    setIsLoading(false)
                }
            })()
        } else {
            setIsLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [integrationId])

    const foundConfiguration: SelfServiceConfiguration | undefined =
        configurations.find(
            (configuration) => configuration.shop_name === shopName
        )

    return {
        isLoading,
        configuration: foundConfiguration,
    }
}
