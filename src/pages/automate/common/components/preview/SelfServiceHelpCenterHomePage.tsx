import React from 'react'
import classnames from 'classnames'
import {useHistory} from 'react-router-dom'

import {HELP_CENTER_TEXTS} from 'config/helpCenter'
import {HelpCenter} from 'models/helpCenter/types'
import trackIcon from 'assets/img/self-service/track.svg'
import returnIcon from 'assets/img/self-service/return.svg'
import cancelIcon from 'assets/img/self-service/cancel.svg'
import reportIssueIcon from 'assets/img/self-service/report-issue.svg'

import HelpCenterPreviewHomePage from 'pages/settings/helpCenter/components/HelpCenterPreview/HelpCenterPreviewHomePage'
import {useSelfServicePreviewContext} from './SelfServicePreviewContext'

import css from './SelfServiceHelpCenterHomePage.less'
import useWorkflowsEntrypoints from './hooks/useWorkflowsEntrypoints'
import OrderManagementFlowItemPreview from './OrderManagementFlowItemPreview'

const WorkflowItem = ({label}: {label: string}) => (
    <div className={css.workflowItem}>
        <div className={css.flowLabel}>{label}</div>
        <i className={classnames('material-icons', css.flowChevron)}>
            keyboard_arrow_right
        </i>
    </div>
)

type Props = {
    helpCenter: HelpCenter
}

const SelfServiceHelpCenterHomePage = ({helpCenter}: Props) => {
    const history = useHistory()
    const {selfServiceConfiguration, hoveredOrderManagementFlow} =
        useSelfServicePreviewContext()
    const workflowsEntrypoints = useWorkflowsEntrypoints(
        helpCenter.default_locale
    )

    const helpCenterTexts = HELP_CENTER_TEXTS[helpCenter.default_locale]
    const isInitialEntry = history.length === 1
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
        <div
            className={classnames(css.orderManagementContainer, {
                [css.isInitialEntry]: isInitialEntry,
            })}
        >
            <div className={css.orderManagementItemsContainer}>
                {workflowsEntrypoints.map((entrypoint) => (
                    <div
                        key={entrypoint.workflow_id}
                        className={css.listGroupItem}
                    >
                        <WorkflowItem label={entrypoint.label} />
                    </div>
                ))}

                {selfServiceConfiguration?.track_order_policy.enabled && (
                    <OrderManagementFlowItemPreview
                        icon={trackIcon}
                        isHighlighted={
                            hoveredOrderManagementFlow === 'track_order_policy'
                        }
                    >
                        {helpCenterTexts.manageOrdersLabelTrackOrder}
                    </OrderManagementFlowItemPreview>
                )}
                {selfServiceConfiguration?.return_order_policy.enabled && (
                    <OrderManagementFlowItemPreview
                        icon={returnIcon}
                        isHighlighted={
                            hoveredOrderManagementFlow === 'return_order_policy'
                        }
                    >
                        {helpCenterTexts.manageOrdersLabelReturnOrder}
                    </OrderManagementFlowItemPreview>
                )}
                {selfServiceConfiguration?.cancel_order_policy.enabled && (
                    <OrderManagementFlowItemPreview
                        icon={cancelIcon}
                        isHighlighted={
                            hoveredOrderManagementFlow === 'cancel_order_policy'
                        }
                    >
                        {helpCenterTexts.manageOrdersLabelCancelOrder}
                    </OrderManagementFlowItemPreview>
                )}
                {selfServiceConfiguration?.report_issue_policy.enabled && (
                    <OrderManagementFlowItemPreview
                        icon={reportIssueIcon}
                        isHighlighted={
                            hoveredOrderManagementFlow === 'report_issue_policy'
                        }
                    >
                        {helpCenterTexts.manageOrdersLabelReportIssue}
                    </OrderManagementFlowItemPreview>
                )}
            </div>
        </div>
    )
}

export default SelfServiceHelpCenterHomePage
