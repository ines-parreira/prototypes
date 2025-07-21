import { HELP_CENTER_TEXTS } from 'config/helpCenter'
import { HelpCenter } from 'models/helpCenter/types'
import HelpCenterPreviewAutomation from 'pages/settings/helpCenter/components/HelpCenterPreview/HelpCenterPreviewAutomation'
import HelpCenterPreviewHomePage from 'pages/settings/helpCenter/components/HelpCenterPreview/HelpCenterPreviewHomePage'

import useWorkflowsEntrypoints from './hooks/useWorkflowsEntrypoints'
import { useSelfServicePreviewContext } from './SelfServicePreviewContext'

type Props = {
    helpCenter: HelpCenter
}

const SelfServiceHelpCenterHomePage = ({ helpCenter }: Props) => {
    const { selfServiceConfiguration, hoveredOrderManagementFlow } =
        useSelfServicePreviewContext()
    const workflowsEntrypoints = useWorkflowsEntrypoints(
        helpCenter.default_locale,
    )

    const helpCenterTexts = HELP_CENTER_TEXTS[helpCenter.default_locale]
    const isOrderManagementUnavailable =
        !selfServiceConfiguration?.trackOrderPolicy.enabled &&
        !selfServiceConfiguration?.reportIssuePolicy.enabled &&
        !selfServiceConfiguration?.cancelOrderPolicy.enabled &&
        !selfServiceConfiguration?.returnOrderPolicy.enabled &&
        workflowsEntrypoints.length === 0

    if (isOrderManagementUnavailable) {
        return (
            <HelpCenterPreviewHomePage
                layout={helpCenter.layout}
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
            flows={workflowsEntrypoints.map((entrypoint) => ({
                name: entrypoint.label,
                id: entrypoint.workflow_id,
            }))}
            orderManagement={[
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
            ]}
            highlightedOrderManagement={hoveredOrderManagementFlow}
        />
    )
}

export default SelfServiceHelpCenterHomePage
