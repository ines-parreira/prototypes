import React, {ReactNode} from 'react'
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

const OrderManagementFlowItem = ({
    isHighlighted,
    icon,
    children,
}: {
    isHighlighted: boolean
    icon: string
    children: ReactNode
}) => {
    return (
        <div
            className={classnames(css.orderManagementItem, {
                [css.isHighlighted]: isHighlighted,
            })}
        >
            <img src={icon} alt="" />
            {children}
        </div>
    )
}

type Props = {
    helpCenter: HelpCenter
}

const SelfServiceHelpCenterHomePage = ({helpCenter}: Props) => {
    const history = useHistory()
    const {selfServiceConfiguration, hoveredOrderManagementFlow} =
        useSelfServicePreviewContext()

    const helpCenterTexts = HELP_CENTER_TEXTS[helpCenter.default_locale]
    const isInitialEntry = history.length === 1
    const isOrderManagementUnavailable =
        !selfServiceConfiguration?.track_order_policy.enabled &&
        !selfServiceConfiguration?.report_issue_policy.enabled &&
        !selfServiceConfiguration?.cancel_order_policy.enabled &&
        !selfServiceConfiguration?.return_order_policy.enabled

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
            <div className={css.orderManagementTitle}>
                {helpCenterTexts.homepageManageOrdersTitle}
            </div>
            <div className={css.orderManagementItemsContainer}>
                {selfServiceConfiguration?.track_order_policy.enabled && (
                    <OrderManagementFlowItem
                        icon={trackIcon}
                        isHighlighted={
                            hoveredOrderManagementFlow === 'track_order_policy'
                        }
                    >
                        {helpCenterTexts.manageOrdersLabelTrackOrder}
                    </OrderManagementFlowItem>
                )}
                {selfServiceConfiguration?.return_order_policy.enabled && (
                    <OrderManagementFlowItem
                        icon={returnIcon}
                        isHighlighted={
                            hoveredOrderManagementFlow === 'return_order_policy'
                        }
                    >
                        {helpCenterTexts.manageOrdersLabelReturnOrder}
                    </OrderManagementFlowItem>
                )}
                {selfServiceConfiguration?.cancel_order_policy.enabled && (
                    <OrderManagementFlowItem
                        icon={cancelIcon}
                        isHighlighted={
                            hoveredOrderManagementFlow === 'cancel_order_policy'
                        }
                    >
                        {helpCenterTexts.manageOrdersLabelCancelOrder}
                    </OrderManagementFlowItem>
                )}
                {selfServiceConfiguration?.report_issue_policy.enabled && (
                    <OrderManagementFlowItem
                        icon={reportIssueIcon}
                        isHighlighted={
                            hoveredOrderManagementFlow === 'report_issue_policy'
                        }
                    >
                        {helpCenterTexts.manageOrdersLabelReportIssue}
                    </OrderManagementFlowItem>
                )}
            </div>
        </div>
    )
}

export default SelfServiceHelpCenterHomePage
