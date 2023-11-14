import React, {useMemo} from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import useGetConvertStatus, {
    BundleOnboardingStatus,
    UsageStatus,
} from 'pages/settings/revenue/hooks/useGetConvertStatus'
import {useIsConvertCampaignCappingEnabled} from 'pages/settings/revenue/hooks/useIsConvertCampaignCappingEnabled'

type Props = {
    classes?: string
}

export const ConvertLimitBanner = ({classes}: Props): JSX.Element => {
    const convertStatus = useGetConvertStatus()
    const isConvertCampaignCappingEnabled = useIsConvertCampaignCappingEnabled()

    const isLimitReached = useMemo(
        () =>
            convertStatus &&
            convertStatus.usage_status === UsageStatus.LIMIT_REACHED &&
            convertStatus.bundle_status === BundleOnboardingStatus.INSTALLED,
        [convertStatus]
    )

    if (!isLimitReached || !isConvertCampaignCappingEnabled) return <></>

    return (
        <div className={classNames(classes)}>
            <Alert
                customActions={
                    <div>
                        <Link className="mr-3" to={`/app/settings/billing`}>
                            Upgrade
                        </Link>
                    </div>
                }
                type={AlertType.Error}
            >
                You've reached the limit for your Convert plan - a sign of
                success in driving conversions. As a result, your campaigns are
                currently on hold. But there's a solution - upgrade now to bring
                them back to your website.
            </Alert>
        </div>
    )
}

export default ConvertLimitBanner
