import React from 'react'
import classnames from 'classnames'

import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'
import {GorgiasChatIntegration} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import SelfServiceChatIntegrationFooter from './components/SelfServiceChatIntegrationFooter'
import MousePointer from './components/MousePointer'
import useOrdersPagePreview, {PreviewStep} from './hooks/useOrdersPagePreview'
import useOrderDates from './hooks/useOrderDates'
import {useSelfServicePreviewContext} from './SelfServicePreviewContext'
import {LINE_ITEMS} from './constants'

import css from './SelfServiceChatIntegrationOrdersPage.less'

type Props = {
    integration: GorgiasChatIntegration
}

const SelfServiceChatIntegrationOrdersPage = ({integration}: Props) => {
    const {orderManagementFlow} = useSelfServicePreviewContext()
    const {previewStep} = useOrdersPagePreview()

    const language = integration.meta.language || 'en-US'
    const sspTexts = GORGIAS_CHAT_SSP_TEXTS[language]

    const {orderPlacedDate} = useOrderDates(language)

    return (
        <div className={css.container}>
            <div className={css.contentContainer}>
                <div className={css.title}>{sspTexts.yourOrders}</div>
                <div className={css.orderContainer}>
                    <div className={css.orderHeader}>
                        <div className={css.orderDetails}>
                            <div className={css.orderNumber}>
                                {sspTexts.order} #3089
                            </div>
                            <div className={css.orderDate}>
                                {orderPlacedDate.format('L')}
                            </div>
                            <div className={css.orderTotalPrice}>$20.00</div>
                        </div>
                        <i
                            className={classnames(
                                'material-icons',
                                css.collapseIcon
                            )}
                        >
                            keyboard_double_arrow_up
                        </i>
                    </div>
                    <div className={css.fulfillment}>
                        <div className={css.fulfillmentStatus}>
                            <div className={css.actions}>
                                {orderManagementFlow ===
                                    'track_order_policy' && (
                                    <MousePointer
                                        isHovering={
                                            previewStep > PreviewStep.INITIAL
                                        }
                                        isAlignedToRight={
                                            previewStep >
                                            PreviewStep.TRACK_HOVER
                                        }
                                    >
                                        <Button
                                            size="small"
                                            intent="secondary"
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
                                )}
                                <Button size="small" intent="secondary">
                                    {sspTexts.reportIssue}
                                </Button>
                            </div>
                            {orderManagementFlow === 'track_order_policy' && (
                                <Badge type={ColorType.LightSuccess}>
                                    {sspTexts.inTransit}
                                </Badge>
                            )}
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
            <SelfServiceChatIntegrationFooter sspTexts={sspTexts} />
        </div>
    )
}

export default SelfServiceChatIntegrationOrdersPage
