import React, {useEffect} from 'react'
import classnames from 'classnames'
import {useHistory} from 'react-router-dom'

import {HELP_CENTER_TEXTS} from 'config/helpCenter'
import {HelpCenter} from 'models/helpCenter/types'

import {useSelfServicePreviewContext} from './SelfServicePreviewContext'
import {SELF_SERVICE_PREVIEW_ROUTES} from './constants'

import css from './SelfServiceHelpCenterReportIssueReasonsPage.less'

type Props = {
    helpCenter: HelpCenter
}

const SelfServiceHelpCenterReportIssueReasonsPage = ({helpCenter}: Props) => {
    const helpCenterTexts = HELP_CENTER_TEXTS[helpCenter.default_locale]

    const history = useHistory()
    const {
        reportOrderIssueReasons = [],
        reportOrderIssueReason,
        hoveredReportOrderIssueReason,
    } = useSelfServicePreviewContext()

    useEffect(() => {
        if (reportOrderIssueReason) {
            history.replace(SELF_SERVICE_PREVIEW_ROUTES.REPORT_ISSUE)
        }
    }, [history, reportOrderIssueReason])

    return (
        <div className={css.container}>
            <div className={css.header}>
                <div className={css.title}>
                    {helpCenterTexts.whatIsWrongWithOrder}
                </div>
                <div className={css.description}>
                    {helpCenterTexts.orderNumber.replace(
                        '{{orderNumber}}',
                        '#3089'
                    )}
                </div>
            </div>
            {reportOrderIssueReasons.map((reason) => (
                <div
                    key={reason}
                    className={classnames(css.item, {
                        [css.isHovered]:
                            reason === hoveredReportOrderIssueReason,
                    })}
                >
                    {helpCenterTexts[reason]}
                    <i
                        className={classnames(
                            'material-icons',
                            css.chevronRightIcon,
                            {
                                [css.isHovered]:
                                    reason === hoveredReportOrderIssueReason,
                            }
                        )}
                    >
                        chevron_right
                    </i>
                </div>
            ))}
            {!reportOrderIssueReasons.length && (
                <div className={classnames(css.item, css.isPlaceholder)}>
                    Issue option
                    <i
                        className={classnames(
                            'material-icons',
                            css.chevronRightIcon
                        )}
                    >
                        chevron_right
                    </i>
                </div>
            )}
        </div>
    )
}

export default SelfServiceHelpCenterReportIssueReasonsPage
