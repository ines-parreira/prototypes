import React, {useState} from 'react'
import {Map} from 'immutable'
import {Link} from 'react-router-dom'
import {useSelector} from 'react-redux'

import ToggleInput from '../../../common/forms/ToggleInput'
import {generateConfiguration} from '../utils/generateConfiguration'
import ForwardIcon from '../../../integrations/detail/components/ForwardIcon'
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
import {getHasAutomationAddOn} from '../../../../state/billing/selectors'
import AutomationSubscriptionModal from '../../billing/automation/AutomationSubscriptionModal'
import UpgradeButton from '../../../common/components/UpgradeButton'
import {getIconFromUrl} from '../../../../utils'

import css from './PreferencesView.less'

// TODO: uncomment this once advanced track order is implemented
// const automationTrackModal = getIconFromUrl(
//     'paywalls/screens/automation_add_on_track_modal.png'
// )
const automationReportModal = getIconFromUrl(
    'paywalls/screens/automation_add_on_report_modal.png'
)

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
    const [modalImage, setModalImage] = useState('')
    const [modalHeaderDescription, setModalHeaderDescription] = useState('')

    const hasSelfServeAddOn = useSelector(getHasAutomationAddOn)

    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)

    const integrationType: ShopType = integration.get('type')
    const shopName: string = integration.getIn(['meta', 'shop_name'])

    const onChange = async (value: boolean) => {
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
            <td className="smallest align-middle">
                <ToggleInput
                    isToggled={enabled}
                    onClick={onChange}
                    isLoading={loading}
                />
            </td>
            <td className={css.policyTd}>
                <AutomationSubscriptionModal
                    confirmLabel="Confirm"
                    image={modalImage}
                    headerDescription={modalHeaderDescription}
                    isOpen={isAutomationModalOpened}
                    onClose={() => setIsAutomationModalOpened(false)}
                />
                {policyKey === PolicyEnum.RETURN_ORDER_POLICY ? (
                    <Link
                        to={`/app/settings/self-service/${integrationType}/${shopName}/preferences/returns`}
                    >
                        <div className={css.policyRowInfo}>
                            <div className={css.content}>
                                <span className={css.policyName}>
                                    {policyName}
                                </span>
                                <span className={css.policyDescription}>
                                    {policyDescription}
                                </span>
                            </div>
                        </div>
                    </Link>
                ) : policyKey === PolicyEnum.CANCEL_ORDER_POLICY ? (
                    <Link
                        to={`/app/settings/self-service/${integrationType}/${shopName}/preferences/cancellations`}
                    >
                        <div className={css.policyRowInfo}>
                            <div className={css.content}>
                                <span className={css.policyName}>
                                    {policyName}
                                </span>
                                <span className={css.policyDescription}>
                                    {policyDescription}
                                </span>
                            </div>
                        </div>
                    </Link>
                ) : policyKey === PolicyEnum.REPORT_ISSUE_POLICY ? (
                    <>
                        {hasSelfServeAddOn ? (
                            <Link
                                to={`/app/settings/self-service/${integrationType}/${shopName}/preferences/report-issue`}
                            >
                                <div className={css.policyRowInfo}>
                                    <div className={css.content}>
                                        <span className={css.policyName}>
                                            {policyName}
                                        </span>
                                        <span className={css.policyDescription}>
                                            {policyDescription}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className={css.policyRowInfo}>
                                <div className={css.content}>
                                    <span className={css.policyName}>
                                        {policyName}
                                    </span>
                                    <span className={css.policyDescription}>
                                        {policyDescription}
                                    </span>
                                </div>
                                <UpgradeButton
                                    label="Get Automation Features"
                                    onClick={() => {
                                        setModalHeaderDescription(
                                            'Access to next level features for self-service'
                                        )
                                        setModalImage(automationReportModal)
                                        setIsAutomationModalOpened(true)
                                    }}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className={css.policyRowInfo}>
                        <div className={css.content}>
                            <span className={css.policyName}>{policyName}</span>
                            <span className={css.policyDescription}>
                                {policyDescription}
                            </span>
                        </div>
                        {/*TODO: uncomment once advanced track order is implemented */}
                        {/*{!hasSelfServeAddOn && (*/}
                        {/*    <UpgradeButton*/}
                        {/*        label="Get Automation Features"*/}
                        {/*        onClick={() => {*/}
                        {/*            setModalImage(automationTrackModal)*/}
                        {/*            setIsAutomationModalOpened(true)*/}
                        {/*        }}*/}
                        {/*    />*/}
                        {/*)}*/}
                    </div>
                )}
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
                {policyKey === PolicyEnum.REPORT_ISSUE_POLICY &&
                    hasSelfServeAddOn && (
                        <ForwardIcon
                            href={`/app/settings/self-service/${integrationType}/${shopName}/preferences/report-issue`}
                        />
                    )}
            </td>
        </tr>
    )
}
