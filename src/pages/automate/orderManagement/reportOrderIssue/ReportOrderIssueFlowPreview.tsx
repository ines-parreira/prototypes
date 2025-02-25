import React, { useMemo } from 'react'

import { createMemoryHistory } from 'history'

import { SELF_SERVICE_PREVIEW_ROUTES } from 'pages/automate/common/components/preview/constants'
import SelfServicePreview from 'pages/automate/common/components/preview/SelfServicePreview'
import SelfServicePreviewContainer from 'pages/automate/common/components/preview/SelfServicePreviewContainer'
import SelfServicePreviewContext from 'pages/automate/common/components/preview/SelfServicePreviewContext'

import { useOrderManagementPreviewContext } from '../OrderManagementPreviewContext'

type Props = {
    hasHoveredScenario: boolean
}

const ReportOrderIssueFlowPreview = ({ hasHoveredScenario }: Props) => {
    const history = useMemo(
        () =>
            createMemoryHistory({
                initialEntries: [SELF_SERVICE_PREVIEW_ROUTES.ORDERS],
            }),
        [],
    )
    const { channels, channel, onChannelChange } =
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
                        orderManagementFlow: 'reportIssuePolicy',
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
