import React from 'react'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

import css from './HelpCenterOrderManagementFlow.less'

import cancelIcon from './icons/cancel.svg'
import reportIssueIcon from './icons/report-issue.svg'
import returnIcon from './icons/return.svg'
import trackIcon from './icons/track.svg'

type Props = {
    sspTexts: {[key: string]: string}
    selfServiceConfiguration: SelfServiceConfiguration
}

const HelpCenterOrderManagementFlow = ({
    sspTexts,
    selfServiceConfiguration,
}: Props) => {
    return (
        <div className={css.container}>
            {selfServiceConfiguration.track_order_policy.enabled && (
                <div className={css.item}>
                    <img src={trackIcon} width={56} alt="" />
                    {sspTexts.trackOrder}
                </div>
            )}
            {selfServiceConfiguration.return_order_policy.enabled && (
                <div className={css.item}>
                    <img src={returnIcon} width={56} alt="" />
                    {sspTexts.returnOrder}
                </div>
            )}
            {selfServiceConfiguration.cancel_order_policy.enabled && (
                <div className={css.item}>
                    <img src={cancelIcon} width={56} alt="" />
                    {sspTexts.cancelOrder}
                </div>
            )}
            {selfServiceConfiguration.report_issue_policy.enabled && (
                <div className={css.item}>
                    <img src={reportIssueIcon} width={56} alt="" />
                    {sspTexts.reportIssue}
                </div>
            )}
        </div>
    )
}

export default HelpCenterOrderManagementFlow
