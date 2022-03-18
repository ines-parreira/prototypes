import {Link} from 'react-router-dom'
import React, {useCallback, useEffect, useState} from 'react'
import {fromJS, Map} from 'immutable'

import ToggleInput from '../../../common/forms/ToggleInput'
import {getIconFromType} from '../../../../state/integrations/helpers'
import {generateConfiguration} from '../utils/generateConfiguration'
import ForwardIcon from '../../../integrations/detail/components/ForwardIcon'
import {
    SelfServiceConfiguration,
    ShopType,
} from '../../../../models/selfServiceConfiguration/types'
import {updateSelfServiceConfiguration} from '../../../../models/selfServiceConfiguration/resources'

import {selfServiceConfigurationUpdated} from '../../../../state/entities/selfServiceConfigurations/actions'
import useAppDispatch from '../../../../hooks/useAppDispatch'

import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'

import {updateOrCreateIntegration} from '../../../../state/integrations/actions'

import {IntegrationType} from '../../../../models/integration/constants'

import css from './IntegrationRow.less'

interface Props {
    shopifyIntegration: Map<any, any>
    selfServiceIntegration?: Map<any, any>
    configuration?: SelfServiceConfiguration
}

export const IntegrationRow = ({
    shopifyIntegration,
    selfServiceIntegration,
    configuration,
}: Props) => {
    const dispatch = useAppDispatch()
    const [loading, setLoading] = useState(false)
    const shopName: string = shopifyIntegration.getIn(['meta', 'shop_name'])
    const integrationType: ShopType = shopifyIntegration.get('type')

    const selfServiceIntegrationData = {
        name: `Self-service for ${shopName}`,
        type: IntegrationType.SelfService,
        meta: {shop_name: shopName},
        deactivated_datetime: configuration
            ? configuration.deactivated_datetime
            : new Date().toISOString(),
    }

    const createSelfServiceIntegration = useCallback(async () => {
        if (!selfServiceIntegration) {
            await dispatch(
                updateOrCreateIntegration(fromJS(selfServiceIntegrationData))
            )
        }
    }, [selfServiceIntegration])

    useEffect(() => {
        void createSelfServiceIntegration()
    }, [createSelfServiceIntegration])

    const _onChange = async (value: boolean) => {
        setLoading(true)

        const deactivated_datetime = value ? null : new Date().toISOString()
        const baseConfiguration =
            configuration || generateConfiguration(0, integrationType, shopName)

        try {
            const [res] = await Promise.all([
                updateSelfServiceConfiguration({
                    ...baseConfiguration,
                    deactivated_datetime,
                }),
                selfServiceIntegration
                    ? dispatch(
                          updateOrCreateIntegration(
                              selfServiceIntegration.set(
                                  'deactivated_datetime',
                                  deactivated_datetime
                              )
                          )
                      )
                    : null,
            ])

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
        <tr key={shopifyIntegration.get('id')}>
            <td className="smallest align-middle">
                <ToggleInput
                    isToggled={enabled}
                    onClick={_onChange}
                    isLoading={loading}
                />
            </td>
            <td className="link-full-td">
                <Link
                    to={`/app/settings/self-service/${integrationType}/${shopName}/preferences`}
                >
                    <div className={css.nameAndLogoWrapper}>
                        <img
                            alt="Shopify logo"
                            role="presentation"
                            className={css.logo}
                            src={getIconFromType('shopify')}
                        />

                        <b>{shopName}</b>
                    </div>
                </Link>
            </td>
            <td className="smallest align-middle">
                <ForwardIcon
                    href={`/app/settings/self-service/${integrationType}/${shopName}/preferences`}
                />
            </td>
        </tr>
    )
}
