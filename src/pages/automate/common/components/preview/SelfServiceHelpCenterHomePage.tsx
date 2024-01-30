import React from 'react'

import {HELP_CENTER_TEXTS} from 'config/helpCenter'
import {HelpCenter} from 'models/helpCenter/types'

import HelpCenterPreviewHomePage from 'pages/settings/helpCenter/components/HelpCenterPreview/HelpCenterPreviewHomePage'
import HelpCenterPreviewAutomation from 'pages/settings/helpCenter/components/HelpCenterPreview/HelpCenterPreviewAutomation'
import {useSelfServicePreviewContext} from './SelfServicePreviewContext'

import useWorkflowsEntrypoints from './hooks/useWorkflowsEntrypoints'

type Props = {
    helpCenter: HelpCenter
}

const SelfServiceHelpCenterHomePage = ({helpCenter}: Props) => {
    const {selfServiceConfiguration, hoveredOrderManagementFlow} =
        useSelfServicePreviewContext()
    const workflowsEntrypoints = useWorkflowsEntrypoints(
        helpCenter.default_locale
    )

    const helpCenterTexts = HELP_CENTER_TEXTS[helpCenter.default_locale]
    const isOrderManagementUnavailable =
        !selfServiceConfiguration?.track_order_policy.enabled &&
        !selfServiceConfiguration?.report_issue_policy.enabled &&
        !selfServiceConfiguration?.cancel_order_policy.enabled &&
        !selfServiceConfiguration?.return_order_policy.enabled &&
        workflowsEntrypoints.length === 0

    if (isOrderManagementUnavailable) {
        return (
            <HelpCenterPreviewHomePage
                searchPlaceholder={
                    helpCenterTexts.searchComboboxInputPlaceholder
                }
                isSearchbar={!helpCenter.search_deactivated_datetime}
                primaryColor={helpCenter.primary_color}
                primaryFont={helpCenter.primary_font_family}
            />
        )
    }

    return (
        <HelpCenterPreviewAutomation
            flows={workflowsEntrypoints.map((entrypoint) => entrypoint.label)}
            orderManagement={[
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
            ]}
            highlightedOrderManagement={hoveredOrderManagementFlow}
        />
    )
}

export default SelfServiceHelpCenterHomePage
