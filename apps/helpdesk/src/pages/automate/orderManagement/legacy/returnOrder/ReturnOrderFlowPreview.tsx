import React, { useMemo } from 'react'

import { createMemoryHistory } from 'history'

import type { ReturnAction } from 'models/selfServiceConfiguration/types'
import { ReturnActionType } from 'models/selfServiceConfiguration/types'
import { SELF_SERVICE_PREVIEW_ROUTES } from 'pages/automate/common/components/preview/constants'
import SelfServicePreview from 'pages/automate/common/components/preview/SelfServicePreview'
import SelfServicePreviewContainer from 'pages/automate/common/components/preview/SelfServicePreviewContainer'
import SelfServicePreviewContext from 'pages/automate/common/components/preview/SelfServicePreviewContext'

import { useOrderManagementPreviewContext } from '../OrderManagementPreviewContext'

type Props = {
    returnAction: ReturnAction
}

const ReturnOrderFlowPreview = ({ returnAction }: Props) => {
    const history = useMemo(
        () =>
            createMemoryHistory({
                initialEntries: [
                    returnAction.type === ReturnActionType.AutomatedResponse
                        ? SELF_SERVICE_PREVIEW_ROUTES.RETURN
                        : SELF_SERVICE_PREVIEW_ROUTES.RETURN_PORTAL,
                ],
            }),
        [returnAction.type],
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
                    'Connect a Chat or Help center to your store to use this feature.',
            }}
        >
            {(channel) => (
                <SelfServicePreviewContext.Provider
                    value={{
                        orderManagementFlow: 'returnOrderPolicy',
                        automatedResponseMessageContent:
                            returnAction.type ===
                            ReturnActionType.AutomatedResponse
                                ? returnAction.responseMessageContent
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
