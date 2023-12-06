import React, {useMemo} from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {isAdmin} from 'utils'
import useAppSelector from 'hooks/useAppSelector'
import useGetConvertStatus, {
    BundleOnboardingStatus,
} from 'pages/settings/revenue/hooks/useGetConvertStatus'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {useIsConvertCampaignBundleWarningEnabled} from 'pages/settings/revenue/hooks/useIsConvertCampaignBundleWarningEnabled'

type Props = {
    classes?: string
    shopIntegrationId?: number
}

export const ConvertSetupBanner = ({
    classes,
    shopIntegrationId,
}: Props): JSX.Element => {
    const isConvertSubscriber = useIsConvertSubscriber()
    const currentUser = useAppSelector((state) => state.currentUser)

    const isConvertCampaignBundleWarningEnabled =
        useIsConvertCampaignBundleWarningEnabled()

    const convertStatus = useGetConvertStatus(
        isConvertCampaignBundleWarningEnabled,
        shopIntegrationId
    )

    const isBundleNotInstalled = useMemo(
        () =>
            convertStatus &&
            convertStatus.bundle_status ===
                BundleOnboardingStatus.NOT_INSTALLED,
        [convertStatus]
    )

    const isButtonVisible = useMemo(
        () => isBundleNotInstalled && isAdmin(currentUser),
        [currentUser, isBundleNotInstalled]
    )

    if (!isBundleNotInstalled) return <></>

    // don't show banner for non subscribers if flag is not enabled
    if (!isConvertCampaignBundleWarningEnabled && !isConvertSubscriber)
        return <></>

    return (
        <div className={classNames(classes)}>
            <Alert
                customActions={
                    isButtonVisible ? (
                        <div>
                            <Link
                                className="mr-3"
                                to={`/app/settings/convert/installations`}
                            >
                                Continue Setup
                            </Link>
                        </div>
                    ) : undefined
                }
                type={AlertType.Warning}
            >
                {isConvertSubscriber
                    ? 'Ensure proper campaign functionality by completing the Convert setup'
                    : 'Install Convert on your store before January 1 for the campaigns to work correctly'}
            </Alert>
        </div>
    )
}

export default ConvertSetupBanner
