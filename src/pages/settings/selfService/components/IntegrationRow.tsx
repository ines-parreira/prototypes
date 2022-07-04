import {Link} from 'react-router-dom'
import React, {useCallback, useEffect} from 'react'
import {fromJS, Map} from 'immutable'

import {getIconFromType} from '../../../../state/integrations/helpers'
import ForwardIcon from '../../../integrations/common/components/ForwardIcon'
import {ShopType} from '../../../../models/selfServiceConfiguration/types'

import useAppDispatch from '../../../../hooks/useAppDispatch'

import {updateOrCreateIntegration} from '../../../../state/integrations/actions'

import {IntegrationType} from '../../../../models/integration/constants'

import css from './IntegrationRow.less'

interface Props {
    shopifyIntegration: Map<any, any>
    selfServiceIntegration?: Map<any, any>
}

export const IntegrationRow = ({
    shopifyIntegration,
    selfServiceIntegration,
}: Props) => {
    const dispatch = useAppDispatch()
    const shopName: string = shopifyIntegration.getIn(['meta', 'shop_name'])
    const integrationType: ShopType = shopifyIntegration.get('type')

    const selfServiceIntegrationData = {
        name: `Self-service for ${shopName}`,
        type: IntegrationType.SelfService,
        meta: {shop_name: shopName},
        deactivated_datetime: null,
    }

    const createSelfServiceIntegration = useCallback(async () => {
        if (!selfServiceIntegration) {
            await dispatch(
                updateOrCreateIntegration(fromJS(selfServiceIntegrationData))
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selfServiceIntegration])

    useEffect(() => {
        void createSelfServiceIntegration()
    }, [createSelfServiceIntegration])

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
