import React, {useMemo} from 'react'

import {createMemoryHistory} from 'history'

import {HelpCenter} from 'models/helpCenter/types'
import SelfServicePreview from 'pages/automation/common/components/preview/SelfServicePreview'
import SelfServicePreviewContainer from 'pages/automation/common/components/preview/SelfServicePreviewContainer'
import SelfServicePreviewContext from 'pages/automation/common/components/preview/SelfServicePreviewContext'
import {SELF_SERVICE_PREVIEW_ROUTES} from 'pages/automation/common/components/preview/constants'
import useSelfServiceChatChannels from '../../common/hooks/useSelfServiceChatChannels'

interface Props {
    shopName: string
    shopType: string
    helpCenter: HelpCenter | undefined
}

const ArticleRecommendationPreview = ({
    shopName,
    shopType,
    helpCenter,
}: Props) => {
    const chatIntegrations = useSelfServiceChatChannels(shopType, shopName)

    const history = useMemo(
        () =>
            createMemoryHistory({
                initialEntries: [
                    SELF_SERVICE_PREVIEW_ROUTES.ARTICLE_RECOMMENDATION,
                ],
            }),
        []
    )

    return (
        <SelfServicePreviewContainer
            channels={helpCenter !== undefined ? chatIntegrations : []}
            alert={
                helpCenter && {
                    message:
                        'Connect a chat to your store to use this feature.',
                    action: {
                        message: 'Go To Chat Settings',
                        href: '/app/settings/channels/gorgias_chat',
                    },
                }
            }
        >
            {(channel) =>
                helpCenter && (
                    <SelfServicePreviewContext.Provider value={{}}>
                        <SelfServicePreview
                            channel={channel}
                            history={history}
                        />
                    </SelfServicePreviewContext.Provider>
                )
            }
        </SelfServicePreviewContainer>
    )
}

export default ArticleRecommendationPreview
