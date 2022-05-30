import React from 'react'

import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import {GorgiasChatIntegration} from 'models/integration/types/gorgiasChat'

import {OrderManagementFlow} from 'pages/settings/selfService/components/QuickResponseFlowsPreferences/components/SelfServicePreview/components/OrderManagementFlow'
import {QuickResponseFlow} from 'pages/settings/selfService/components/QuickResponseFlowsPreferences/components/SelfServicePreview/components/QuickResponseFlow'
import {SelfServicePreviewFooter} from 'pages/settings/selfService/components/QuickResponseFlowsPreferences/components/SelfServicePreview/components/SelfServicePreviewFooter'
import {useActiveQuickResponseFlows} from 'pages/integrations/integration/hooks/useActiveQuickResponseFlows'

type SelfServiceOnArticleRecommendationOffProps = {
    configuration: SelfServiceConfiguration | undefined
    integration: GorgiasChatIntegration
    sspTexts: Record<string, string>
}

export const SelfServiceOnArticleRecommendationOff = ({
    configuration,
    integration,
    sspTexts,
}: SelfServiceOnArticleRecommendationOffProps): JSX.Element => {
    const quickResponses: string[] = useActiveQuickResponseFlows(
        configuration
    ).map((response) => response.title)

    return (
        <>
            <div>
                <QuickResponseFlow
                    quickResponses={quickResponses}
                    sspTexts={sspTexts}
                />
                {configuration && (
                    <OrderManagementFlow
                        selfServiceConfiguration={configuration}
                        sspTexts={sspTexts}
                    />
                )}
            </div>
            <SelfServicePreviewFooter
                backgroundColor={integration.decoration?.main_color}
                sspTexts={sspTexts}
            />
        </>
    )
}
