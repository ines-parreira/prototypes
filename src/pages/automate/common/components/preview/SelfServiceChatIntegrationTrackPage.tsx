import React from 'react'

import classnames from 'classnames'

import graphicTShirt from 'assets/img/self-service/graphic-t-shirt.png'
import uspsLogo from 'assets/img/self-service/usps.png'
import {
    getPrimaryLanguageFromChatConfig,
    GORGIAS_CHAT_SSP_TEXTS,
} from 'config/integrations/gorgias_chat'
import { GorgiasChatIntegration } from 'models/integration/types'

import useOrderDates from './hooks/useOrderDates'
import useTrackPagePreview from './hooks/useTrackPagePreview'

import css from './SelfServiceChatIntegrationTrackPage.less'

type Props = {
    integration: GorgiasChatIntegration
}

const SelfServiceChatIntegrationTrackPage = ({ integration }: Props) => {
    const language = getPrimaryLanguageFromChatConfig(integration.meta)
    const sspTexts = GORGIAS_CHAT_SSP_TEXTS[language]

    const { ref } = useTrackPagePreview()
    const { etaDate, inTransitDate } = useOrderDates(language)

    return (
        <div ref={ref} className={css.container}>
            <div className={css.header}>
                <div className={css.titleContainer}>
                    <div className={css.title}>{sspTexts.order} #3089</div>
                    <span className={css.description}>
                        {sspTexts.fulfillment} 1 {sspTexts.of} 1 –{' '}
                        <span className={css.descriptionSeeItems}>
                            {sspTexts.seeItems}
                        </span>
                    </span>
                </div>
                <img
                    className={css.thumbnail}
                    src={graphicTShirt}
                    height={48}
                    width={48}
                    alt=""
                />
            </div>
            <div className={css.separator} />
            <div className={css.etaContainer}>
                <span className={css.etaCaption}>
                    {sspTexts.estimatedDelivery}
                </span>
                <div className={css.eta}>
                    {etaDate.format('dddd[, ]MMMM D')}
                </div>
            </div>
            <div className={css.shippingCarrier}>
                <img
                    className={css.shippingCarrierLogo}
                    src={uspsLogo}
                    height={44}
                    width={44}
                    alt=""
                />
                <div className={css.shippingCarrierContent}>
                    <div className={css.shippingCarrierTitle}>
                        {sspTexts.trackOrderSentVia?.replace(
                            '{trackingCompany}',
                            'USPS',
                        )}
                    </div>
                    <div className={css.shippingCarrierSubtitle}>
                        <div>
                            {sspTexts.tracking}:{' '}
                            <span className={css.shippingCarrierTrackingNumber}>
                                6547566547...
                            </span>
                        </div>
                        <div className={css.shippingCarrierCopyIcon}>
                            <i className="material-icons">content_copy</i>
                        </div>
                    </div>
                </div>
            </div>
            <div className={css.timelineContainer}>
                <div className={css.timelineItems}>
                    <div className={css.timelineItem}>
                        <div className={css.timeline}>
                            <div
                                className={classnames(
                                    css.timelineDot,
                                    css.isCurrent,
                                )}
                            />
                            <div className={css.timelineLine} />
                        </div>
                        <div className={css.timelineItemContent}>
                            <div>
                                <div
                                    className={classnames(
                                        css.timelineItemStatus,
                                        css.isCurrent,
                                    )}
                                >
                                    {sspTexts.checkpointInTransit}
                                </div>
                                <div className={css.timelineItemTimestamp}>
                                    {inTransitDate.format('L - hh:mm a')} |
                                    Dallas, USA
                                </div>
                            </div>
                            <div className={css.timelineItemDescription}>
                                <p>
                                    Carrier accepted or picked up shipment from
                                    the shipper. Shipment is on the way.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className={css.timelineItem}>
                        <div className={css.timeline}>
                            <div
                                className={classnames(
                                    css.timelineDot,
                                    css.isUpcoming,
                                )}
                            />
                        </div>
                        <div className={css.timelineItemContent}>
                            <div
                                className={classnames(
                                    css.timelineItemStatus,
                                    css.isUpcoming,
                                )}
                            >
                                {sspTexts.checkpointOutForDelivery}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={css.timelineLastUpdated}>
                    {sspTexts.lastUpdated}{' '}
                    {etaDate.clone().subtract(2, 'hours').from(etaDate.clone())}
                </div>
            </div>
            <div className={css.separator} />
            <div className={css.shippingContainer}>
                <div className={css.shippingHeader}>
                    {sspTexts.shippingAddress}
                </div>
                <div className={css.shippingAddressContainer}>
                    <div>Mary Smith</div>
                    <div>52 Washburn, San Francisco, CA, 94027</div>
                    <div>United States</div>
                </div>
            </div>
        </div>
    )
}

export default SelfServiceChatIntegrationTrackPage
