import {Link} from 'react-router-dom'
import React, {useEffect, useState} from 'react'
import {Map} from 'immutable'

import ToggleButton from '../../../common/components/ToggleButton'
import {
    SelfServiceConfiguration,
    ShopType,
} from '../../../../state/self_service/types'
import * as SelfServiceActions from '../../../../state/self_service/actions'

import {generateConfiguration} from '../utils/generateConfiguration'
import ForwardIcon from '../../../integrations/detail/components/ForwardIcon.js'

interface Props {
    integration: Map<any, any>
    configuration?: SelfServiceConfiguration
    isLoadingConfigurations: boolean
    actions: typeof SelfServiceActions
}

export const IntegrationRow = ({
    integration,
    configuration,
    isLoadingConfigurations,
    actions,
}: Props) => {
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(isLoadingConfigurations)
    }, [isLoadingConfigurations])

    useEffect(() => {
        setLoading(false)
    }, [configuration])

    const shopName: string = integration.getIn(['meta', 'shop_name'])
    const integrationType: ShopType = integration.get('type')

    const _onChange = (value: boolean) => {
        setLoading(true)

        const deactivated_datetime = value ? null : new Date().toISOString()

        const baseConfiguration =
            configuration || generateConfiguration(0, integrationType, shopName)

        const promise = actions.updateSelfServiceConfigurations({
            ...baseConfiguration,
            deactivated_datetime,
        }) as any // FIXME: better typing

        // eslint-disable-next-line
        promise.finally(() => {
            // prevent infinite loading state of the toggle if the ssp-api is down
            setLoading(false)
        })

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
                    <div>
                        <b>{shopName}</b>
                    </div>
                </Link>
            </td>
            <td className="smallest align-middle">
                <ToggleButton
                    value={enabled}
                    loading={loading}
                    onChange={_onChange}
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
