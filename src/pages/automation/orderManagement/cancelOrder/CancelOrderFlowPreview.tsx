import React, {useMemo} from 'react'
import {createMemoryHistory} from 'history'

import {ResponseMessageContent} from 'models/selfServiceConfiguration/types'
import SelfServicePreviewContext from 'pages/automation/common/components/preview/SelfServicePreviewContext'
import SelfServicePreview from 'pages/automation/common/components/preview/SelfServicePreview'
import SelfServicePreviewContainer from 'pages/automation/common/components/preview/SelfServicePreviewContainer'
import {SELF_SERVICE_PREVIEW_ROUTES} from 'pages/automation/common/components/preview/constants'

import {useOrderManagementPreviewContext} from '../OrderManagementPreviewContext'

type Props = {
    responseMessageContent?: ResponseMessageContent
}

const CancelOrderFlowPreview = ({responseMessageContent}: Props) => {
    const history = useMemo(
        () =>
            createMemoryHistory({
                initialEntries: [SELF_SERVICE_PREVIEW_ROUTES.CANCEL],
            }),
        []
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
                    'Connect a chat or help center to your store to use this feature.',
            }}
        >
            {(channel) => (
                <SelfServicePreviewContext.Provider
                    value={{
                        orderManagementFlow: 'cancel_order_policy',
                        automatedResponseMessageContent: responseMessageContent,
                    }}
                >
                    <SelfServicePreview channel={channel} history={history} />
                </SelfServicePreviewContext.Provider>
            )}
        </SelfServicePreviewContainer>
    )
}

export default CancelOrderFlowPreview
