import React from 'react'
import HelpCenterPreviewAutomation from 'pages/settings/helpCenter/components/HelpCenterPreview/HelpCenterPreviewAutomation'
import {HelpCenter} from 'models/helpCenter/types'
import {HELP_CENTER_TEXTS} from 'config/helpCenter'
import HelpCenterPreviewHomePage from 'pages/settings/helpCenter/components/HelpCenterPreview/HelpCenterPreviewHomePage'
import {Entrypoint} from 'pages/automate/common/components/WorkflowsFeatureList'
import {useHelpCenterFlows} from '../../hooks/useHelpCenterFlows'
import HelpCenterPreview from '../../../HelpCenterPreview/HelpCenterPreview'

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
    const {selfServiceConfiguration, workflowConfigurations} =
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
                    (wfConfiguration) => wfConfiguration.id === flow.workflow_id
                )?.name ?? '',
        }))

    const orderManagement = [
        ...(selfServiceConfiguration?.track_order_policy.enabled
            ? (['track_order_policy'] as const)
            : []),
        ...(selfServiceConfiguration?.return_order_policy.enabled
            ? (['return_order_policy'] as const)
            : []),
        ...(selfServiceConfiguration?.cancel_order_policy.enabled
            ? (['cancel_order_policy'] as const)
            : []),
        ...(selfServiceConfiguration?.report_issue_policy.enabled
            ? (['report_issue_policy'] as const)
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
