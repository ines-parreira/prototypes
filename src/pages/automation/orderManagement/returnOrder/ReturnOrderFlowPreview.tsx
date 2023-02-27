import React, {useMemo} from 'react'
import {createMemoryHistory} from 'history'

import {
    ReturnAction,
    ReturnActionType,
    SelfServiceConfiguration,
} from 'models/selfServiceConfiguration/types'
import SelfServicePreviewContext from 'pages/automation/common/components/preview/SelfServicePreviewContext'
import SelfServicePreview from 'pages/automation/common/components/preview/SelfServicePreview'
import SelfServicePreviewContainer from 'pages/automation/common/components/preview/SelfServicePreviewContainer'
import {SelfServiceChannel} from 'pages/automation/common/hooks/useSelfServiceChannels'
import {SELF_SERVICE_PREVIEW_ROUTES} from 'pages/automation/common/components/preview/constants'

type Props = {
    channels: SelfServiceChannel[]
    selfServiceConfiguration: SelfServiceConfiguration
    returnAction: ReturnAction
}

const ReturnOrderFlowPreview = ({
    channels,
    selfServiceConfiguration,
    returnAction,
}: Props) => {
    const history = useMemo(
        () =>
            createMemoryHistory({
                initialEntries: [
                    returnAction.type === ReturnActionType.AutomatedResponse
                        ? SELF_SERVICE_PREVIEW_ROUTES.RETURN
                        : SELF_SERVICE_PREVIEW_ROUTES.RETURN_PORTAL,
                ],
            }),
        [returnAction.type]
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
                        selfServiceConfiguration,
                        orderManagementFlow: 'return_order_policy',
                        automatedResponseMessageContent:
                            returnAction.type ===
                            ReturnActionType.AutomatedResponse
                                ? returnAction.response_message_content
                                : undefined,
                    }}
                >
                    <SelfServicePreview channel={channel} history={history} />
                </SelfServicePreviewContext.Provider>
            )}
        </SelfServicePreviewContainer>
    )
}

export default ReturnOrderFlowPreview
