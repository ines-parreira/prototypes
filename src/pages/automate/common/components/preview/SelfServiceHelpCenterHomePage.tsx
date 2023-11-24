import React from 'react'
import classnames from 'classnames'
import {useHistory} from 'react-router-dom'

import {HELP_CENTER_TEXTS} from 'config/helpCenter'
import {HelpCenter} from 'models/helpCenter/types'
import trackIcon from 'assets/img/self-service/track.svg'
import returnIcon from 'assets/img/self-service/return.svg'
import cancelIcon from 'assets/img/self-service/cancel.svg'
import reportIssueIcon from 'assets/img/self-service/report-issue.svg'
import gorgiasLogo from 'assets/img/help-center/gorgias-logo.svg'

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
            <div
                className={classnames(css.container, {
                    [css.isInitialEntry]: isInitialEntry,
                })}
            >
                <div className={css.searchBar}>
                    <i
                        className={classnames(
                            'material-icons',
                            css.searchBarIcon
                        )}
                    >
                        search
                    </i>
                    {helpCenterTexts.searchComboboxInputPlaceholder}
                </div>
                <div className={css.title}>
                    {helpCenterTexts.getMoreInformationLabel}
                </div>
                <div className={css.seeAll}>
                    {helpCenterTexts.homePageAllArticlesLinkLabel}
                    <i className={classnames('material-icons', css.seeAllIcon)}>
                        arrow_forward
                    </i>
                </div>
                <div className={css.articlesContainer}>
                    <div className={css.article}>
                        <div className={css.articleTitle}>
                            Lorem ipsum dolor sit amet
                        </div>
                        <div className={css.articleDescription}>
                            Viva Forevis aptent taciti sociosqu ad litora
                            torquent. Si u mundo tá muito paradis? Toma um mé
                            que o mundo vai girarzis! Nullam volutpat risus nec
                            leo commodo, ut interdum diam laoreet.
                        </div>
                    </div>
                    <div className={css.article}>
                        <div className={css.articleTitle}>
                            Lorem ipsum dolor sit amet
                        </div>
                        <div className={css.articleDescription}>
                            Viva Forevis aptent taciti sociosqu ad litora
                            torquent. Si u mundo tá muito paradis? Toma um mé
                            que o mundo vai girarzis! Nullam volutpat risus nec
                            leo commodo, ut interdum diam laoreet.
                        </div>
                    </div>
                </div>
                <div className={css.footer}>
                    {helpCenterTexts.poweredByGorgiasTextBeforeLogo}
                    <img src={gorgiasLogo} alt="Gorgias" />
                </div>
            </div>
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
