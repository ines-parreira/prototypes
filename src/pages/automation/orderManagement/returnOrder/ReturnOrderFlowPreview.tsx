import React, {useMemo} from 'react'
import {createMemoryHistory} from 'history'

import {
    ReturnAction,
    ReturnActionType,
} from 'models/selfServiceConfiguration/types'
import SelfServicePreviewContext from 'pages/automation/common/components/preview/SelfServicePreviewContext'
import SelfServicePreview from 'pages/automation/common/components/preview/SelfServicePreview'
import SelfServicePreviewContainer from 'pages/automation/common/components/preview/SelfServicePreviewContainer'
import {SELF_SERVICE_PREVIEW_ROUTES} from 'pages/automation/common/components/preview/constants'

import {useOrderManagementPreviewContext} from '../OrderManagementPreviewContext'

type Props = {
    returnAction: ReturnAction
}

const ReturnOrderFlowPreview = ({returnAction}: Props) => {
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
    const {channels, channel, onChannelChange} =
        useOrderManagementPreviewContext()

    return (
        <SelfServicePreviewContainer
            channels={channels}
            channel={channel}
            onChange={onChannelChange}
            alert={{
                message:
                    'Connect a Chat or Help center to your store to use this feature.',
            }}
        >
            {(channel) => (
                <SelfServicePreviewContext.Provider
                    value={{
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
