import React, {useMemo} from 'react'
import {createMemoryHistory} from 'history'

import {
    PolicyKey,
    SelfServiceConfiguration,
} from 'models/selfServiceConfiguration/types'
import {SelfServiceChannel} from 'pages/automation/common/hooks/useSelfServiceChannels'
import SelfServicePreview from 'pages/automation/common/components/preview/SelfServicePreview'
import SelfServicePreviewContainer from 'pages/automation/common/components/preview/SelfServicePreviewContainer'
import SelfServicePreviewContext from 'pages/automation/common/components/preview/SelfServicePreviewContext'

type Props = {
    channels: SelfServiceChannel[]
    selfServiceConfiguration: SelfServiceConfiguration
    hoveredOrderManagementFlow?: PolicyKey
}

const OrderManagementPreview = ({
    channels,
    selfServiceConfiguration,
    hoveredOrderManagementFlow,
}: Props) => {
    const history = useMemo(
        () => createMemoryHistory(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selfServiceConfiguration.id]
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
                        hoveredOrderManagementFlow,
                    }}
                >
                    <SelfServicePreview channel={channel} history={history} />
                </SelfServicePreviewContext.Provider>
            )}
        </SelfServicePreviewContainer>
    )
}

export default OrderManagementPreview
