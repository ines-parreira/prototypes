import React, { useEffect } from 'react'

import { useHistory } from 'react-router-dom'

import {
    getPrimaryLanguageFromChatConfig,
    GORGIAS_CHAT_SSP_TEXTS,
} from 'config/integrations/gorgias_chat'
import List from 'gorgias-design-system/List/List'
import ListItem from 'gorgias-design-system/List/ListItem'
import type { GorgiasChatIntegration } from 'models/integration/types'
import { ChevronRightIcon } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/icon-utils'

import { SELF_SERVICE_PREVIEW_ROUTES } from './constants'
import { useSelfServicePreviewContext } from './SelfServicePreviewContext'

import css from './SelfServiceChatIntegrationReportIssueReasonsPage.less'

type Props = {
    integration: GorgiasChatIntegration
}

const SelfServiceChatIntegrationReportIssueReasonsPage = ({
    integration,
}: Props) => {
    const language = getPrimaryLanguageFromChatConfig(integration.meta)
    const sspTexts = GORGIAS_CHAT_SSP_TEXTS[language]

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
            <h3 className={css.header}>{sspTexts.whatIsWrongWithOrder}</h3>
            <List shouldDisplayShadow={false} style={{ marginLeft: '-12px' }}>
                {reportOrderIssueReasons.map((reason) => (
                    <ListItem
                        className={
                            reason === hoveredReportOrderIssueReason
                                ? 'active'
                                : ''
                        }
                        key={reason}
                        label={sspTexts[reason]}
                        trailIcon={<ChevronRightIcon />}
                    />
                ))}
                {!reportOrderIssueReasons.length && (
                    <ListItem
                        label="Issue option"
                        trailIcon={<ChevronRightIcon />}
                    />
                )}
            </List>
        </div>
    )
}

export default SelfServiceChatIntegrationReportIssueReasonsPage
