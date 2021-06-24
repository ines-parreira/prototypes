import {Link} from 'react-router-dom'
import React from 'react'
import {Map} from 'immutable'

import ToggleButton from '../../../common/components/ToggleButton'
import {
    SelfServiceConfiguration,
    ShopType,
} from '../../../../state/self_service/types'
import * as SelfServiceActions from '../../../../state/self_service/actions'
import {getIconFromType} from '../../../../state/integrations/helpers'

import {generateConfiguration} from '../utils/generateConfiguration'
import ForwardIcon from '../../../integrations/detail/components/ForwardIcon.js'

import css from './IntegrationRow.less'

interface Props {
    integration: Map<any, any>
    configuration?: SelfServiceConfiguration
    actions: typeof SelfServiceActions
}

export const IntegrationRow = ({
    integration,
    configuration,
    actions,
}: Props) => {
    const shopName: string = integration.getIn(['meta', 'shop_name'])
    const integrationType: ShopType = integration.get('type')

    const _onChange = (value: boolean) => {
        const deactivated_datetime = value ? null : new Date().toISOString()

        const baseConfiguration =
            configuration || generateConfiguration(0, integrationType, shopName)

        actions.updateSelfServiceConfigurations({
            ...baseConfiguration,
            deactivated_datetime,
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
                <ToggleButton value={enabled} onChange={_onChange} />
            </td>
            <td className="smallest align-middle">
                <ForwardIcon
                    href={`/app/settings/self-service/${integrationType}/${shopName}/preferences`}
                />
            </td>
        </tr>
    )
}
