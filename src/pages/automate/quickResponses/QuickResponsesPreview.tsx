import React, {useEffect, useMemo} from 'react'
import {createMemoryHistory} from 'history'

import {
    QuickResponsePolicy,
    SelfServiceConfiguration,
} from 'models/selfServiceConfiguration/types'
import {SelfServiceChatChannel} from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import {SELF_SERVICE_PREVIEW_ROUTES} from 'pages/automate/common/components/preview/constants'
import SelfServicePreview from 'pages/automate/common/components/preview/SelfServicePreview'
import UncontrolledSelfServicePreviewContainer from 'pages/automate/common/components/preview/UncontrolledSelfServicePreviewContainer'
import SelfServicePreviewContext from 'pages/automate/common/components/preview/SelfServicePreviewContext'
import useAppSelector from 'hooks/useAppSelector'
import {getChatsApplicationAutomationSettings} from 'state/entities/chatsApplicationAutomationSettings/selectors'
import SelfServiceFeatureDisabledOnChannelAlert from 'pages/automate/common/components/preview/SelfServiceFeatureDisabledOnChannelAlert'

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
    const applicationsAutomationSettings = useAppSelector(
        getChatsApplicationAutomationSettings
    )

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
                message: 'Connect a Chat to your store to use this feature.',
                action: {
                    message: 'Go to chat settings',
                    href: '/app/settings/channels/gorgias_chat',
                },
            }}
        >
            {(channel) => {
                const applicationId = channel.value.meta.app_id!
                const applicationAutomationSettings =
                    applicationsAutomationSettings[applicationId]
                const areQuickResponsesDisabled =
                    applicationAutomationSettings?.quickResponses.enabled ===
                    false

                if (areQuickResponsesDisabled) {
                    return (
                        <SelfServiceFeatureDisabledOnChannelAlert
                            shopName={selfServiceConfiguration.shop_name}
                            shopType={selfServiceConfiguration.type}
                        />
                    )
                }

                return (
                    <SelfServicePreviewContext.Provider
                        value={{
                            selfServiceConfiguration,
                            quickResponse: expandedQuickResponse,
                            hoveredQuickResponseId,
                            workflowsEntrypoints:
                                applicationAutomationSettings?.workflows
                                    ?.entrypoints,
                        }}
                    >
                        <SelfServicePreview
                            channel={channel}
                            history={history}
                        />
                    </SelfServicePreviewContext.Provider>
                )
            }}
        </UncontrolledSelfServicePreviewContainer>
    )
}

export default QuickResponsesPreview
