import React, {useEffect, useMemo} from 'react'
import {createMemoryHistory} from 'history'

import {
    QuickResponsePolicy,
    SelfServiceConfiguration,
} from 'models/selfServiceConfiguration/types'
import {SelfServiceChatChannel} from 'pages/automation/common/hooks/useSelfServiceChatChannels'
import {SELF_SERVICE_PREVIEW_ROUTES} from 'pages/automation/common/components/preview/constants'
import SelfServicePreview from 'pages/automation/common/components/preview/SelfServicePreview'
import UncontrolledSelfServicePreviewContainer from 'pages/automation/common/components/preview/UncontrolledSelfServicePreviewContainer'
import SelfServicePreviewContext from 'pages/automation/common/components/preview/SelfServicePreviewContext'

type Props = {
    channels: SelfServiceChatChannel[]
    selfServiceConfiguration: SelfServiceConfiguration
    expandedQuickResponse?: QuickResponsePolicy
    hoveredQuickResponseId: QuickResponsePolicy['id'] | null
}

const QuickResponsesPreview = ({
    channels,
    selfServiceConfiguration,
    expandedQuickResponse,
    hoveredQuickResponseId,
}: Props) => {
    const history = useMemo(
        () => createMemoryHistory(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selfServiceConfiguration.id]
    )

    const hasExpandedQuickResponse = Boolean(expandedQuickResponse)

    useEffect(() => {
        if (hasExpandedQuickResponse) {
            history.replace(SELF_SERVICE_PREVIEW_ROUTES.QUICK_RESPONSE)
        } else {
            history.replace(SELF_SERVICE_PREVIEW_ROUTES.HOME)
        }
    }, [history, hasExpandedQuickResponse])

    return (
        <UncontrolledSelfServicePreviewContainer
            channels={channels}
            alert={{
                message: 'Connect a chat to your store to use this feature.',
                action: {
                    message: 'Go to chat settings',
                    href: '/app/settings/channels/gorgias_chat',
                },
            }}
        >
            {(channel) => (
                <SelfServicePreviewContext.Provider
                    value={{
                        selfServiceConfiguration,
                        quickResponse: expandedQuickResponse,
                        hoveredQuickResponseId,
                    }}
                >
                    <SelfServicePreview channel={channel} history={history} />
                </SelfServicePreviewContext.Provider>
            )}
        </UncontrolledSelfServicePreviewContainer>
    )
}

export default QuickResponsesPreview
