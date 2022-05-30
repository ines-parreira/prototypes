import React from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {getCurrentUser} from 'state/currentUser/selectors'

import {GorgiasChatIntegration} from 'models/integration/types/gorgiasChat'

import QuickResponseReplies from 'pages/settings/selfService/components/QuickResponseFlowItem/components/QuickResponseReplies/QuickResponseReplies'
import MessageContent from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/MessageContent'

type SelfServiceOffArticleRecommendationOnProps = {
    integration: GorgiasChatIntegration
}

export const SelfServiceOffArticleRecommendationOn = ({
    integration,
}: SelfServiceOffArticleRecommendationOnProps): JSX.Element => {
    const currentUser = useAppSelector(getCurrentUser)
    return (
        <>
            <MessageContent
                conversationColor=""
                currentUser={currentUser}
                customerInitialMessages={['What size am I?']}
                hideMessageTimestamp
                agentMessages={[
                    {
                        content: 'Here is an article that may help:',
                        isHtml: false,
                        attachments: [],
                    },
                    {
                        content: '',
                        isHtml: true,
                        attachments: [
                            {
                                title: 'What size should I order?',
                                summary:
                                    'Unsure what size will work? Check out our sizing guide located above the sizes offered on each product page...',
                            },
                        ],
                    },
                    {
                        content: 'Was it helpful?',
                        isHtml: false,
                        attachments: [],
                    },
                ]}
            />
            <QuickResponseReplies
                quickReplies={['Yes, thank you', 'No, I need more help']}
                mainColor={integration.decoration?.main_color}
            />
        </>
    )
}
