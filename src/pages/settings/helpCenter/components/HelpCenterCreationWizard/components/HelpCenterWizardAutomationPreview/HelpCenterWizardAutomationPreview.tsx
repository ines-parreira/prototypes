import React from 'react'

import { HELP_CENTER_TEXTS } from 'config/helpCenter'
import { HelpCenter } from 'models/helpCenter/types'
import { Entrypoint } from 'pages/automate/common/components/WorkflowsFeatureList'
import HelpCenterPreviewAutomation from 'pages/settings/helpCenter/components/HelpCenterPreview/HelpCenterPreviewAutomation'
import HelpCenterPreviewHomePage from 'pages/settings/helpCenter/components/HelpCenterPreview/HelpCenterPreviewHomePage'

import HelpCenterPreview from '../../../HelpCenterPreview/HelpCenterPreview'
import { useHelpCenterFlows } from '../../hooks/useHelpCenterFlows'

type Props = {
    shopName: string
    shopType: string
    helpCenter: HelpCenter
    orderManagementEnabled?: boolean
    flows: Entrypoint[]
}

const HelpCenterWizardAutomationPreview = ({
    shopName,
    shopType,
    helpCenter,
    orderManagementEnabled,
    flows,
}: Props) => {
    const { selfServiceConfiguration, workflowConfigurations } =
        useHelpCenterFlows({
            flows,
            shopType,
            shopName,
            supportedLocales: helpCenter.supported_locales,
        })
    const enabledFlows = flows
        .filter((flow) => flow.enabled)
        .map((flow) => ({
            id: flow.workflow_id,
            name:
                workflowConfigurations?.find(
                    (wfConfiguration) =>
                        wfConfiguration.id === flow.workflow_id,
                )?.name ?? '',
        }))

    const orderManagement = [
        ...(selfServiceConfiguration?.trackOrderPolicy.enabled
            ? (['trackOrderPolicy'] as const)
            : []),
        ...(selfServiceConfiguration?.returnOrderPolicy.enabled
            ? (['returnOrderPolicy'] as const)
            : []),
        ...(selfServiceConfiguration?.cancelOrderPolicy.enabled
            ? (['cancelOrderPolicy'] as const)
            : []),
        ...(selfServiceConfiguration?.reportIssuePolicy.enabled
            ? (['reportIssuePolicy'] as const)
            : []),
    ]

    const helpCenterTexts = HELP_CENTER_TEXTS[helpCenter.default_locale]

    const isEmptyPreview = !orderManagementEnabled && enabledFlows.length === 0

    if (isEmptyPreview) {
        return (
            <HelpCenterPreview
                name={helpCenter.name}
                logoUrl={helpCenter.brand_logo_url}
            >
                <HelpCenterPreviewHomePage
                    layout={helpCenter.layout}
                    searchPlaceholder={
                        helpCenterTexts.searchComboboxInputPlaceholder
                    }
                    isSearchbar={!helpCenter.search_deactivated_datetime}
                    primaryColor={helpCenter.primary_color}
                    primaryFont={helpCenter.primary_font_family}
                />
            </HelpCenterPreview>
        )
    }

    return (
        <HelpCenterPreview
            name={helpCenter.name}
            logoUrl={helpCenter.brand_logo_url}
        >
            <HelpCenterPreviewAutomation
                flows={enabledFlows}
                orderManagement={orderManagementEnabled ? orderManagement : []}
                primaryFont={helpCenter.primary_font_family}
                primaryColor={helpCenter.primary_color}
            />
        </HelpCenterPreview>
    )
}

export default HelpCenterWizardAutomationPreview
