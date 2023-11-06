import React, {useMemo} from 'react'
import {createMemoryHistory} from 'history'

import SelfServicePreviewContext from 'pages/automation/common/components/preview/SelfServicePreviewContext'
import SelfServicePreview from 'pages/automation/common/components/preview/SelfServicePreview'
import SelfServicePreviewContainer from 'pages/automation/common/components/preview/SelfServicePreviewContainer'
import {SELF_SERVICE_PREVIEW_ROUTES} from 'pages/automation/common/components/preview/constants'
import {ReportIssueCaseReason} from 'models/selfServiceConfiguration/types'

import {useOrderManagementPreviewContext} from '../OrderManagementPreviewContext'

type Props = {
    reasons: ReportIssueCaseReason[]
    expandedReasonKey: ReportIssueCaseReason['reasonKey'] | null
    hoveredReasonKey: ReportIssueCaseReason['reasonKey'] | null
}

const ReportOrderIssueFlowScenarioPreview = ({
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
    const {channels, channel, onChannelChange} =
        useOrderManagementPreviewContext()

    return (
        <SelfServicePreviewContainer
            channels={channels}
            channel={channel}
            onChange={onChannelChange}
            alert={{
                message:
                    'Connect a Chat or Help Center to your store to use this feature.',
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
