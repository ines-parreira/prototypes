import React, {useMemo} from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'
import moment from 'moment-timezone'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import useGetConvertStatus, {
    BundleOnboardingStatus,
    UsageStatus,
} from 'pages/settings/revenue/hooks/useGetConvertStatus'
import {formatDatetime} from 'utils'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {DateAndTimeFormatting} from 'constants/datetime'

type Props = {
    classes?: string
    shopIntegrationId?: number
}

export const ConvertLimitBanner = ({
    classes,
    shopIntegrationId,
}: Props): JSX.Element => {
    const status = useGetConvertStatus(false, shopIntegrationId)
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.LongDateWithYear
    )

    const {
        isLimitReached,
        isExceedingUsage,
        isAutoUpgradeEnabled,
        estimatedReachDate,
    } = useMemo(() => {
        if (!status) return {}

        return {
            isLimitReached:
                status.usage_status === UsageStatus.LIMIT_REACHED &&
                status.bundle_status === BundleOnboardingStatus.INSTALLED,
            isExceedingUsage:
                status.usage_status === UsageStatus.OK &&
                status.bundle_status === BundleOnboardingStatus.INSTALLED &&
                status.last_warning_100_at &&
                status.cycle_start &&
                status.cycle_end &&
                moment.utc(status.cycle_start) <=
                    moment.utc(status.last_warning_100_at) &&
                moment.utc(status.last_warning_100_at) <=
                    moment.utc(status.cycle_end),
            isAutoUpgradeEnabled: status.auto_upgrade_enabled,
            estimatedReachDate:
                status.estimated_reach_date &&
                formatDatetime(status.estimated_reach_date, datetimeFormat),
        }
    }, [datetimeFormat, status])

    let type = AlertType.Error
    let cta = <></>
    let message = <></>

    if (isLimitReached) {
        cta = (
            <Link className="mr-3" to={`/app/settings/billing/process/convert`}>
                Upgrade
            </Link>
        )
        message = (
            <>
                You've reached the limit for your Convert plan - a sign of
                success in driving conversions. As a result, your campaigns are
                currently on hold. But there's a solution - upgrade now to bring
                them back to your website
            </>
        )
    } else if (isExceedingUsage) {
        type = AlertType.Warning

        if (isAutoUpgradeEnabled) {
            cta = (
                <a
                    href="https://docs.gorgias.com/en-US/convert-pricing-348387"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn more
                </a>
            )
            message = (
                <>
                    According to your current usage of campaign clicks, you will
                    reach 100% of your click allowance before on{' '}
                    {estimatedReachDate}. You will be auto-upgraded when you
                    will reach 100% of your click.
                </>
            )
        } else {
            cta = (
                <Link
                    className="mr-3"
                    to={`/app/settings/billing/process/convert`}
                >
                    Activate auto-upgrade
                </Link>
            )
            message = (
                <>
                    According to your current usage of campaign clicks, you will
                    reach 100% of your click allowance on {estimatedReachDate}.
                    From this date, your campaigns won’t be displayed to your
                    shoppers anymore. Want to avoid this?
                </>
            )
        }
    } else {
        return <></>
    }

    return (
        <div className={classNames(classes)}>
            <Alert customActions={<div>{cta}</div>} type={type}>
                {message}
            </Alert>
        </div>
    )
}

export default ConvertLimitBanner
