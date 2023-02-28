import React, {useMemo} from 'react'
import {createMemoryHistory} from 'history'

import SelfServicePreviewContext from 'pages/automation/common/components/preview/SelfServicePreviewContext'
import SelfServicePreview from 'pages/automation/common/components/preview/SelfServicePreview'
import SelfServicePreviewContainer from 'pages/automation/common/components/preview/SelfServicePreviewContainer'
import {SelfServiceChannel} from 'pages/automation/common/hooks/useSelfServiceChannels'
import {SELF_SERVICE_PREVIEW_ROUTES} from 'pages/automation/common/components/preview/constants'
import {ReportIssueCaseReason} from 'models/selfServiceConfiguration/types'

type Props = {
    channels: SelfServiceChannel[]
    reasons: ReportIssueCaseReason[]
    expandedReasonKey: ReportIssueCaseReason['reasonKey'] | null
    hoveredReasonKey: ReportIssueCaseReason['reasonKey'] | null
}

const ReportOrderIssueFlowScenarioPreview = ({
    channels,
    reasons,
    expandedReasonKey,
    hoveredReasonKey,
}: Props) => {
    const history = useMemo(
        () =>
            createMemoryHistory({
                initialEntries: [
                    SELF_SERVICE_PREVIEW_ROUTES.REPORT_ISSUE_REASONS,
                ],
            }),
        []
    )
    const expandedReason = reasons.find(
        (reason) => reason.reasonKey === expandedReasonKey
    )

    return (
        <SelfServicePreviewContainer
            channels={channels}
            alert={{
                message:
                    'Connect a chat or help center to your store to use this feature.',
            }}
        >
            {(channel) => (
                <SelfServicePreviewContext.Provider
                    value={{
                        orderManagementFlow: 'report_issue_policy',
                        reportOrderIssueReasons: reasons.map(
                            (reason) => reason.reasonKey
                        ),
                        reportOrderIssueReason: expandedReason,
                        hoveredReportOrderIssueReason: hoveredReasonKey,
                        automatedResponseMessageContent:
                            expandedReason?.action?.responseMessageContent,
                    }}
                >
                    <SelfServicePreview channel={channel} history={history} />
                </SelfServicePreviewContext.Provider>
            )}
        </SelfServicePreviewContainer>
    )
}

export default ReportOrderIssueFlowScenarioPreview
