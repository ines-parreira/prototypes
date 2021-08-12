import React, {useEffect, useState} from 'react'
import {Map} from 'immutable'

import ToggleButton from '../../../common/components/ToggleButton'

import {generateConfiguration} from '../utils/generateConfiguration'
import {SelfServiceConfiguration} from '../../../../models/selfServiceConfiguration/types'
import useAppDispatch from '../../../../hooks/useAppDispatch'
import {updateSelfServiceConfiguration} from '../../../../models/selfServiceConfiguration/resources'
import {selfServiceConfigurationUpdated} from '../../../../state/entities/selfServiceConfigurations/actions'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'

interface Props {
    integration: Map<any, any>
    configuration?: SelfServiceConfiguration
    isLoadingConfigurations: boolean
}

export const MigratedIntegrationRow = ({
    integration,
    configuration,
    isLoadingConfigurations,
}: Props) => {
    const dispatch = useAppDispatch()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(isLoadingConfigurations)
    }, [isLoadingConfigurations])

    useEffect(() => {
        setLoading(false)
    }, [configuration])

    const _onChange = async (value: boolean) => {
        setLoading(true)

        const deactivated_datetime = value ? null : new Date().toISOString()

        const baseConfiguration =
            configuration ||
            generateConfiguration(
                0,
                integration.get('type'),
                integration.getIn(['meta', 'shop_name'])
            )

        try {
            const res = await updateSelfServiceConfiguration({
                ...baseConfiguration,
                deactivated_datetime,
            })
            void dispatch(selfServiceConfigurationUpdated(res))
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Self-service configuration successfully updated.',
                })
            )
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'Could not update Self-service configuration, please try again later.',
                })
            )
        } finally {
            setLoading(false)
        }

        return null
    }

    const enabled = configuration
        ? configuration.deactivated_datetime === null
        : false

    return (
        <tr key={integration.get('id')}>
            <td className="pl-0">
                <div>
                    <b>{integration.getIn(['meta', 'shop_name'])}</b>
                </div>
            </td>
            <td className="smallest align-middle">
                <ToggleButton
                    value={enabled}
                    loading={loading}
                    onChange={_onChange}
                />
            </td>
        </tr>
    )
}
