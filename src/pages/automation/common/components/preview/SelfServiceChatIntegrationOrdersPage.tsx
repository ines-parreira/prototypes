import React from 'react'
import classnames from 'classnames'
import {useHistory} from 'react-router-dom'

import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'
import {GorgiasChatIntegration} from 'models/integration/types'

import Button from 'gorgias-design-system/Buttons/Button'
import Badge from 'gorgias-design-system/Badge/Badge'
import SelfServiceChatIntegrationFooter from './components/SelfServiceChatIntegrationFooter'
import MousePointer from './components/MousePointer'
import useOrdersPagePreview, {PreviewStep} from './hooks/useOrdersPagePreview'
import {useSelfServicePreviewContext} from './SelfServicePreviewContext'
import {LINE_ITEMS} from './constants'

import css from './SelfServiceChatIntegrationOrdersPage.less'

type Props = {
    integration: GorgiasChatIntegration
}

const SelfServiceChatIntegrationOrdersPage = ({integration}: Props) => {
    const {orderManagementFlow, hasHoveredReportOrderIssueScenario} =
        useSelfServicePreviewContext()
    const {previewStep} = useOrdersPagePreview()

    const history = useHistory()
    const language = integration.meta.language || 'en-US'
    const sspTexts = GORGIAS_CHAT_SSP_TEXTS[language]
    const isInitialEntry = history.length === 1

    return (
        <div
            className={classnames(css.container, {
                [css.isInitialEntry]: isInitialEntry,
            })}
        >
            <div className={css.contentContainer}>
                <div className={css.title}>{sspTexts.yourOrders}</div>
                <div className={css.orderContainer}>
                    <div className={css.orderHeader}>
                        <div className={css.orderDetails}>
                            <div className={css.orderNumber}>
                                {sspTexts.order} #3089
                            </div>
                            <div className={css.orderTotalPrice}>$20.00</div>
                        </div>
                    </div>
                    <div className={css.fulfillment}>
                        <div>
                            <div className={css.fulfillmentShipment}>
                                <p className={css.shipment}>Shipment</p>
                                {orderManagementFlow ===
                                    'track_order_policy' && (
                                    <Badge
                                        label={sspTexts.inTransit}
                                        color="accessoryGreen"
                                    />
                                )}
                            </div>
                            <div className={css.actions}>
                                {orderManagementFlow ===
                                    'track_order_policy' && (
                                    <>
                                        <MousePointer
                                            isHovering={
                                                previewStep >
                                                PreviewStep.INITIAL
                                            }
                                            isAlignedToRight={
                                                previewStep >
                                                PreviewStep.TRACK_HOVER
                                            }
                                        >
                                            <Button
                                                size="small"
                                                variant="secondary"
                                                className={classnames(
                                                    css.flowButton,
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
                                                {sspTexts.track}
                                            </Button>
                                        </MousePointer>
                                        <Button
                                            key={sspTexts.reportIssue}
                                            variant="secondary"
                                            size="small"
                                        >
                                            {sspTexts.reportIssue}
                                        </Button>
                                    </>
                                )}
                                {orderManagementFlow ===
                                    'report_issue_policy' && (
                                    <>
                                        <Button
                                            size="small"
                                            variant="secondary"
                                        >
                                            {sspTexts.track}
                                        </Button>
                                        <MousePointer
                                            isHovering={
                                                hasHoveredReportOrderIssueScenario
                                            }
                                            isAlignedToRight={
                                                hasHoveredReportOrderIssueScenario
                                            }
                                        >
                                            <Button
                                                size="small"
                                                variant="secondary"
                                                className={classnames(
                                                    css.flowButton,
                                                    {
                                                        [css.isActive]:
                                                            hasHoveredReportOrderIssueScenario,
                                                    }
                                                )}
                                            >
                                                {sspTexts.reportIssue}
                                            </Button>
                                        </MousePointer>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className={css.fulfillmentLineItems}>
                            {LINE_ITEMS.map((item) => (
                                <div key={item.name} className={css.lineItem}>
                                    <img
                                        src={item.src}
                                        className={css.thumbnail}
                                        height={48}
                                        width={48}
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
                                            <span
                                                className={css.lineItemQuantity}
                                            >
                                                x1
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <SelfServiceChatIntegrationFooter
                sspTexts={sspTexts}
                color={integration.decoration.main_color}
            />
        </div>
    )
}

export default SelfServiceChatIntegrationOrdersPage
