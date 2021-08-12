import {Link} from 'react-router-dom'
import React, {useState} from 'react'
import {Map} from 'immutable'

import ToggleButton from '../../../common/components/ToggleButton'
import {getIconFromType} from '../../../../state/integrations/helpers'
import {generateConfiguration} from '../utils/generateConfiguration'
import ForwardIcon from '../../../integrations/detail/components/ForwardIcon.js'
import {
    SelfServiceConfiguration,
    ShopType,
} from '../../../../models/selfServiceConfiguration/types'
import {updateSelfServiceConfiguration} from '../../../../models/selfServiceConfiguration/resources'

import {selfServiceConfigurationUpdated} from '../../../../state/entities/selfServiceConfigurations/actions'
import useAppDispatch from '../../../../hooks/useAppDispatch'

import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'

import css from './IntegrationRow.less'

interface Props {
    integration: Map<any, any>
    configuration?: SelfServiceConfiguration
}

export const IntegrationRow = ({integration, configuration}: Props) => {
    const dispatch = useAppDispatch()
    const [loading, setLoading] = useState(false)

    const shopName: string = integration.getIn(['meta', 'shop_name'])
    const integrationType: ShopType = integration.get('type')

    const _onChange = async (value: boolean) => {
        setLoading(true)

        const deactivated_datetime = value ? null : new Date().toISOString()
        const baseConfiguration =
            configuration || generateConfiguration(0, integrationType, shopName)

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
            <td className="link-full-td">
                <Link
                    to={`/app/settings/self-service/${integrationType}/${shopName}/preferences`}
                >
                    <div className={css.nameAndLogoWrapper}>
                        <img
                            alt={`Shopify logo`}
                            role="presentation"
                            className={css.logo}
                            src={getIconFromType('shopify')}
                        />

                        <b>{shopName}</b>
                    </div>
                </Link>
            </td>
            <td className="smallest align-middle">
                <ToggleButton
                    value={enabled}
                    onChange={_onChange}
                    loading={loading}
                />
            </td>
            <td className="smallest align-middle">
                <ForwardIcon
                    href={`/app/settings/self-service/${integrationType}/${shopName}/preferences`}
                />
            </td>
        </tr>
    )
}
