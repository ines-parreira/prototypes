import React from 'react'
import classnames from 'classnames'
import {useHistory} from 'react-router-dom'

import {HelpCenter} from 'models/helpCenter/types'
import {HELP_CENTER_TEXTS} from 'config/helpCenter'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import MousePointer from './components/MousePointer'
import useOrderDates from './hooks/useOrderDates'
import useOrdersPagePreview, {PreviewStep} from './hooks/useOrdersPagePreview'
import {useSelfServicePreviewContext} from './SelfServicePreviewContext'
import {LINE_ITEMS} from './constants'

import css from './SelfServiceHelpCenterOrdersPage.less'

type Props = {
    helpCenter: HelpCenter
}

const SelfServiceHelpCenterOrdersPage = ({helpCenter}: Props) => {
    const {orderManagementFlow, hasHoveredReportOrderIssueScenario} =
        useSelfServicePreviewContext()
    const {previewStep} = useOrdersPagePreview()
    const {orderPlacedDate} = useOrderDates(helpCenter.default_locale)

    const history = useHistory()
    const helpCenterTexts = HELP_CENTER_TEXTS[helpCenter.default_locale]
    const isInitialEntry = history.length === 1

    return (
        <div
            className={classnames(css.container, {
                [css.isInitialEntry]: isInitialEntry,
            })}
        >
            <div className={css.header}>
                <div className={css.orderNumber}>
                    {helpCenterTexts.orderNumber.replace(
                        '{{orderNumber}}',
                        '#3089'
                    )}
                </div>
                <div className={css.orderDate}>
                    {orderPlacedDate.format('L')}
                </div>
            </div>
            <div className={css.summaryLabel}>
                {helpCenterTexts.orderFulfillmentsSummary}
            </div>
            <div className={css.fulfillmentContainer}>
                <div className={css.fulfillmentStatus}>
                    {orderManagementFlow === 'trackOrderPolicy' && (
                        <Badge className={css.badge} type={ColorType.Success}>
                            {helpCenterTexts['fulfillmentStatus.in_transit']}
                        </Badge>
                    )}
                    <div className={css.actions}>
                        {orderManagementFlow === 'trackOrderPolicy' && (
                            <>
                                <MousePointer
                                    isHovering={
                                        previewStep > PreviewStep.INITIAL
                                    }
                                    isAlignedToRight={
                                        previewStep > PreviewStep.TRACK_HOVER
                                    }
                                >
                                    <div
                                        className={classnames(
                                            css.actionButton,
                                            {
                                                [css.isHovered]:
                                                    previewStep ===
                                                        PreviewStep.TRACK_HOVER ||
                                                    previewStep ===
                                                        PreviewStep.TRACK_HOVERING,
                                                [css.isActive]:
                                                    previewStep ===
                                                    PreviewStep.TRACK_CLICK,
                                            }
                                        )}
                                    >
                                        {helpCenterTexts.orderFlowTrack}
                                    </div>
                                </MousePointer>
                                <div className={css.actionButton}>
                                    {helpCenterTexts.orderFlowReport}
                                </div>
                            </>
                        )}
                        {orderManagementFlow === 'reportIssuePolicy' && (
                            <>
                                <div className={css.actionButton}>
                                    {helpCenterTexts.orderFlowTrack}
                                </div>
                                <MousePointer
                                    isHovering={
                                        hasHoveredReportOrderIssueScenario
                                    }
                                    isAlignedToRight={
                                        hasHoveredReportOrderIssueScenario
                                    }
                                >
                                    <div
                                        className={classnames(
                                            css.actionButton,
                                            {
                                                [css.isActive]:
                                                    hasHoveredReportOrderIssueScenario,
                                            }
                                        )}
                                    >
                                        {helpCenterTexts.orderFlowReport}
                                    </div>
                                </MousePointer>
                            </>
                        )}
                    </div>
                </div>
                <div className={css.lineItems}>
                    {LINE_ITEMS.map((item) => (
                        <div key={item.name} className={css.lineItem}>
                            <img
                                src={item.src}
                                className={css.thumbnail}
                                alt=""
                            />
                            <div className={css.lineItemDescription}>
                                <div className={css.lineItemName}>
                                    {item.name}
                                </div>
                                <div>
                                    <span className={css.lineItemPrice}>
                                        $10.00
                                    </span>
                                    <span className={css.lineItemQuantity}>
                                        x1
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SelfServiceHelpCenterOrdersPage
