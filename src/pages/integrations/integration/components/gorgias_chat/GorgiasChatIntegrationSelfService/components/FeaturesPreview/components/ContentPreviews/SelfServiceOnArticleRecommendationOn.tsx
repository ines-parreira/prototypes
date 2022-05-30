import React from 'react'

import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

import {OrderManagementFlow} from 'pages/settings/selfService/components/QuickResponseFlowsPreferences/components/SelfServicePreview/components/OrderManagementFlow'
import {QuickResponseFlow} from 'pages/settings/selfService/components/QuickResponseFlowsPreferences/components/SelfServicePreview/components/QuickResponseFlow'
import {useActiveQuickResponseFlows} from 'pages/integrations/integration/hooks/useActiveQuickResponseFlows'

import gorgiasChatSendMessageIcon from 'assets/img/integrations/gorgias-chat-send-message-icon-grey.svg'

import css from './ContentPreviews.less'

type SelfServiceOnArticleRecommendationOnProps = {
    configuration: SelfServiceConfiguration | undefined
    sspTexts: Record<string, string>
}

export const SelfServiceOnArticleRecommendationOn = ({
    configuration,
    sspTexts,
}: SelfServiceOnArticleRecommendationOnProps): JSX.Element => {
    const quickResponses: string[] = useActiveQuickResponseFlows(
        configuration
    ).map((response) => response.title)

    return (
        <>
            <div>
                {quickResponses.length > 0 && (
                    <QuickResponseFlow
                        quickResponses={quickResponses}
                        sspTexts={sspTexts}
                    />
                )}
                {configuration && (
                    <OrderManagementFlow
                        selfServiceConfiguration={configuration}
                        sspTexts={sspTexts}
                    />
                )}
            </div>
            <div className={css.faqSearchFooter}>
                <span>{sspTexts.needHelpSendMessage}</span>
                <img
                    className={css.sendMessageIcon}
                    src={gorgiasChatSendMessageIcon}
                    alt="send message icon"
                />
            </div>
        </>
    )
}
