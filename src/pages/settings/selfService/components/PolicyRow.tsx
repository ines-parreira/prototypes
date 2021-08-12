import React, {useState} from 'react'
import {Map} from 'immutable'
import {Link} from 'react-router-dom'

import ToggleButton from '../../../common/components/ToggleButton'
import {generateConfiguration} from '../utils/generateConfiguration'
import ForwardIcon from '../../../integrations/detail/components/ForwardIcon.js'
import {
    PolicyEnum,
    PolicyKey,
    SelfServiceConfiguration,
    ShopType,
} from '../../../../models/selfServiceConfiguration/types'
import {updateSelfServiceConfiguration} from '../../../../models/selfServiceConfiguration/resources'
import useAppDispatch from '../../../../hooks/useAppDispatch'
import {selfServiceConfigurationUpdated} from '../../../../state/entities/selfServiceConfigurations/actions'

import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'

import css from './PreferencesView.less'

interface Props {
    policyKey: PolicyKey
    integration: Map<any, any>
    policyName: string
    policyDescription: string
    configuration: SelfServiceConfiguration
}

export const PolicyRow = ({
    policyKey,
    integration,
    policyName,
    policyDescription,
    configuration,
}: Props) => {
    const dispatch = useAppDispatch()
    const [loading, setLoading] = useState(false)

    const integrationType: ShopType = integration.get('type')
    const shopName: string = integration.getIn(['meta', 'shop_name'])

    const _onChange = async (value: boolean) => {
        setLoading(true)

        const baseConfiguration =
            configuration || generateConfiguration(0, integrationType, shopName)

        const newConfiguration = {
            ...baseConfiguration,
            [policyKey]: {
                ...baseConfiguration[policyKey],
                enabled: value,
            },
        }

        try {
            const res = await updateSelfServiceConfiguration(newConfiguration)
            void dispatch(selfServiceConfigurationUpdated(res))
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Policy successfully updated.',
                })
            )
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Could not update policy, please try again later.',
                })
            )
        } finally {
            setLoading(false)
        }

        return null
    }

    const enabled = configuration[policyKey]?.enabled

    return (
        <tr>
            <td className={css.policyTd}>
                {policyKey === PolicyEnum.RETURN_ORDER_POLICY ? (
                    <Link
                        to={`/app/settings/self-service/${integrationType}/${shopName}/preferences/returns`}
                    >
                        <div className={css.policyRowInfo}>
                            <span className={css.policyName}>{policyName}</span>
                            <span className={css.policyDescription}>
                                {policyDescription}
                            </span>
                        </div>
                    </Link>
                ) : policyKey === PolicyEnum.CANCEL_ORDER_POLICY ? (
                    <Link
                        to={`/app/settings/self-service/${integrationType}/${shopName}/preferences/cancellations`}
                    >
                        <div className={css.policyRowInfo}>
                            <span className={css.policyName}>{policyName}</span>
                            <span className={css.policyDescription}>
                                {policyDescription}
                            </span>
                        </div>
                    </Link>
                ) : policyKey === PolicyEnum.REPORT_ISSUE_POLICY ? (
                    // TODO: uncomment when automation add-on is released
                    // <Link
                    //     to={`/app/settings/self-service/${integrationType}/${shopName}/preferences/report-issue`}
                    // >
                    //     <div className={css.policyRowInfo}>
                    //         <span className={css.policyName}>{policyName}</span>
                    //         <span className={css.policyDescription}>
                    //             {policyDescription}
                    //         </span>
                    //     </div>
                    // </Link>
                    <div className={css.policyRowInfo}>
                        <span className={css.policyName}>{policyName}</span>
                        <span className={css.policyDescription}>
                            {policyDescription}
                        </span>
                    </div>
                ) : (
                    <div className={css.policyRowInfo}>
                        <span className={css.policyName}>{policyName}</span>
                        <span className={css.policyDescription}>
                            {policyDescription}
                        </span>
                    </div>
                )}
            </td>

            <td className="smallest align-middle">
                <ToggleButton
                    value={enabled}
                    onChange={_onChange}
                    loading={loading}
                />
            </td>

            <td className="smallest align-middle">
                {policyKey === PolicyEnum.CANCEL_ORDER_POLICY && (
                    <ForwardIcon
                        href={`/app/settings/self-service/${integrationType}/${shopName}/preferences/cancellations`}
                    />
                )}
                {policyKey === PolicyEnum.RETURN_ORDER_POLICY && (
                    <ForwardIcon
                        href={`/app/settings/self-service/${integrationType}/${shopName}/preferences/returns`}
                    />
                )}
                {/* TODO: uncomment when automation add-on is released */}
                {/*policyKey === PolicyEnum.REPORT_ISSUE_POLICY && (
                    <ForwardIcon
                        href={`/app/settings/self-service/${integrationType}/${shopName}/preferences/report-issue`}
                    />
                )*/}
            </td>
        </tr>
    )
}
