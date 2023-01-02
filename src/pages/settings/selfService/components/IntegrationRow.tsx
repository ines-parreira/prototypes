import {Link} from 'react-router-dom'
import React from 'react'
import {Map} from 'immutable'

import {getIconFromType} from '../../../../state/integrations/helpers'
import ForwardIcon from '../../../integrations/common/components/ForwardIcon'
import {ShopType} from '../../../../models/selfServiceConfiguration/types'

import {IntegrationType} from '../../../../models/integration/constants'

import css from './IntegrationRow.less'

interface Props {
    shopifyIntegration: Map<any, any>
}

export const IntegrationRow = ({shopifyIntegration}: Props) => {
    const shopName: string = shopifyIntegration.getIn(['meta', 'shop_name'])
    const integrationType: ShopType = shopifyIntegration.get('type')

    return (
        <tr key={shopifyIntegration.get('id')}>
            <td className="link-full-td">
                <Link
                    to={`/app/settings/self-service/${integrationType}/${shopName}/preferences`}
                >
                    <div className={css.nameAndLogoWrapper}>
                        <img
                            alt="Shopify logo"
                            role="presentation"
                            className={css.logo}
                            src={getIconFromType(IntegrationType.Shopify)}
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
