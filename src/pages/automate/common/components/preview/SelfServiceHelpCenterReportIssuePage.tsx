import React, { useEffect } from 'react'

import { useHistory } from 'react-router-dom'

import { HELP_CENTER_TEXTS } from 'config/helpCenter'
import { HelpCenter } from 'models/helpCenter/types'

import { SELF_SERVICE_PREVIEW_ROUTES } from './constants'
import SelfServiceHelpCenterRequestSentPage from './SelfServiceHelpCenterRequestSentPage'
import { useSelfServicePreviewContext } from './SelfServicePreviewContext'

import css from './SelfServiceHelpCenterReportIssuePage.less'

type Props = {
    helpCenter: HelpCenter
}

const SelfServiceHelpCenterReportIssuePage = (props: Props) => {
    const { helpCenter } = props
    const history = useHistory()
    const helpCenterTexts = HELP_CENTER_TEXTS[helpCenter.default_locale]

    const { reportOrderIssueReason } = useSelfServicePreviewContext()

    useEffect(() => {
        if (!reportOrderIssueReason) {
            history.replace(SELF_SERVICE_PREVIEW_ROUTES.REPORT_ISSUE_REASONS)
        }
    }, [history, reportOrderIssueReason])

    if (!reportOrderIssueReason) {
        return null
    }

    if (reportOrderIssueReason.action?.showHelpfulPrompt) {
        return (
            <div className={css.container}>
                <span
                    dangerouslySetInnerHTML={{
                        __html: reportOrderIssueReason.action
                            .responseMessageContent.html,
                    }}
                />
                <div>{helpCenterTexts.helpfulPrompt}</div>
                <div className={css.buttonGroup}>
                    <div className={css.button}>
                        {helpCenterTexts.helpfulResponse}
                    </div>
                    <div className={css.button}>
                        {helpCenterTexts.notHelpfulResponse}
                    </div>
                </div>
            </div>
        )
    }

    return <SelfServiceHelpCenterRequestSentPage {...props} />
}

export default SelfServiceHelpCenterReportIssuePage
