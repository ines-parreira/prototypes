import React, {useMemo} from 'react'
import {createMemoryHistory} from 'history'

import SelfServicePreviewContext from 'pages/automation/common/components/preview/SelfServicePreviewContext'
import SelfServicePreview from 'pages/automation/common/components/preview/SelfServicePreview'
import SelfServicePreviewContainer from 'pages/automation/common/components/preview/SelfServicePreviewContainer'
import {SelfServiceChannel} from 'pages/automation/common/hooks/useSelfServiceChannels'
import {SELF_SERVICE_PREVIEW_ROUTES} from 'pages/automation/common/components/preview/constants'

type Props = {
    channels: SelfServiceChannel[]
    hasHoveredScenario: boolean
}

const ReportOrderIssueFlowPreview = ({channels, hasHoveredScenario}: Props) => {
    const history = useMemo(
        () =>
            createMemoryHistory({
                initialEntries: [SELF_SERVICE_PREVIEW_ROUTES.ORDERS],
            }),
        []
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
                        hasHoveredReportOrderIssueScenario: hasHoveredScenario,
                    }}
                >
                    <SelfServicePreview channel={channel} history={history} />
                </SelfServicePreviewContext.Provider>
            )}
        </SelfServicePreviewContainer>
    )
}

export default ReportOrderIssueFlowPreview
