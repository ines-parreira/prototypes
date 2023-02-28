import React, {useEffect} from 'react'
import classnames from 'classnames'
import {useHistory} from 'react-router-dom'

import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'
import {GorgiasChatIntegration} from 'models/integration/types'

import {useSelfServicePreviewContext} from './SelfServicePreviewContext'
import {SELF_SERVICE_PREVIEW_ROUTES} from './constants'

import css from './SelfServiceChatIntegrationReportIssueReasonsPage.less'

type Props = {
    integration: GorgiasChatIntegration
}

const SelfServiceChatIntegrationReportIssueReasonsPage = ({
    integration,
}: Props) => {
    const sspTexts =
        GORGIAS_CHAT_SSP_TEXTS[integration.meta.language || 'en-US']

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
            <div className={css.header}>{sspTexts.whatIsWrongWithOrder}</div>
            {reportOrderIssueReasons.map((reason) => (
                <div
                    key={reason}
                    className={classnames(css.item, {
                        [css.isHovered]:
                            reason === hoveredReportOrderIssueReason,
                    })}
                >
                    {sspTexts[reason]}
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

export default SelfServiceChatIntegrationReportIssueReasonsPage
