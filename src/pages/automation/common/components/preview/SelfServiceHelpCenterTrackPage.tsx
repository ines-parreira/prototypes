import React from 'react'
import classnames from 'classnames'

import {HelpCenter} from 'models/helpCenter/types'
import {HELP_CENTER_TEXTS} from 'config/helpCenter'
import uspsLogo from 'assets/img/self-service/usps.png'

import useOrderDates from './hooks/useOrderDates'
import useTrackPagePreview from './hooks/useTrackPagePreview'
import {LINE_ITEMS} from './constants'

import css from './SelfServiceHelpCenterTrackPage.less'

type Props = {
    helpCenter: HelpCenter
}

const SelfServiceHelpCenterTrackPage = ({helpCenter}: Props) => {
    const helpCenterTexts = HELP_CENTER_TEXTS[helpCenter.default_locale]

    const {ref} = useTrackPagePreview()
    const {etaDate, orderPlacedDate, infoReceivedDate, inTransitDate} =
        useOrderDates(helpCenter.default_locale)

    return (
        <div ref={ref} className={css.container}>
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
            <div className={css.etaWithTimelineContainer}>
                <div className={css.etaContainer}>
                    <div className={css.etaCaption}>
                        {helpCenterTexts.estimatedDelivery}
                    </div>
                    <div className={css.eta}>
                        {etaDate.format('dddd, MMMM Do')}{' '}
                        {helpCenterTexts.expectToBeDeliveredBy}{' '}
                        {etaDate.format('h a')}
                        <i
                            className={classnames(
                                'material-icons',
                                css.etaIcon
                            )}
                        >
                            info_outlined
                        </i>
                    </div>
                </div>
                <div className={css.timelineContainer}>
                    <div className={css.timelineItems}>
                        <div className={css.timelineItem}>
                            <div className={css.timeline}>
                                <div className={css.timelineDot} />
                                <div
                                    className={classnames(
                                        css.timelineLine,
                                        css.isCompleted
                                    )}
                                />
                            </div>
                            <div className={css.timelineItemContent}>
                                <div>
                                    <div className={css.timelineItemStatus}>
                                        {helpCenterTexts.checkpointOrderPlaced}
                                    </div>
                                    <div className={css.timelineItemTimestamp}>
                                        {orderPlacedDate.format('L - hh:mm a')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={css.timelineItem}>
                            <div className={css.timeline}>
                                <div className={css.timelineDot} />
                                <div
                                    className={classnames(
                                        css.timelineLine,
                                        css.isCompleted
                                    )}
                                />
                            </div>
                            <div className={css.timelineItemContent}>
                                <div>
                                    <div className={css.timelineItemStatus}>
                                        {helpCenterTexts.checkpointInfoReceived}
                                    </div>
                                    <div className={css.timelineItemTimestamp}>
                                        {infoReceivedDate.format('L - hh:mm a')}{' '}
                                        | New York, USA
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={css.timelineItem}>
                            <div className={css.timeline}>
                                <div
                                    className={classnames(
                                        css.timelineDot,
                                        css.isCurrent
                                    )}
                                />
                                <div className={css.timelineLine} />
                            </div>
                            <div className={css.timelineItemContent}>
                                <div>
                                    <div
                                        className={classnames(
                                            css.timelineItemStatus,
                                            css.isCurrent
                                        )}
                                    >
                                        {helpCenterTexts.checkpointInTransit}
                                    </div>
                                    <div className={css.timelineItemTimestamp}>
                                        {inTransitDate.format('L - hh:mm a')} |
                                        Dallas, USA
                                    </div>
                                </div>
                                <div className={css.timelineItemDescription}>
                                    Carrier accepted or picked up shipment from
                                    the shipper. Shipment is on the way.
                                </div>
                            </div>
                        </div>
                        <div className={css.timelineItem}>
                            <div className={css.timeline}>
                                <div
                                    className={classnames(
                                        css.timelineDot,
                                        css.isUpcoming
                                    )}
                                />
                                <div className={css.timelineLine} />
                            </div>
                            <div className={css.timelineItemContent}>
                                <div
                                    className={classnames(
                                        css.timelineItemStatus,
                                        css.isUpcoming
                                    )}
                                >
                                    {helpCenterTexts.checkpointOutForDelivery}
                                </div>
                            </div>
                        </div>
                        <div className={css.timelineItem}>
                            <div className={css.timeline}>
                                <div
                                    className={classnames(
                                        css.timelineDot,
                                        css.isUpcoming
                                    )}
                                />
                            </div>
                            <div className={css.timelineItemContent}>
                                <div
                                    className={classnames(
                                        css.timelineItemStatus,
                                        css.isUpcoming
                                    )}
                                >
                                    {helpCenterTexts.checkpointDelivered}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={css.timelineLastUpdated}>
                        {helpCenterTexts.lastUpdated}{' '}
                        {etaDate.from(etaDate.clone().subtract(2, 'hours'))}
                    </div>
                </div>
            </div>
            <div className={css.separator} />
            <div className={css.shippingContainer}>
                <div className={css.shippingHeader}>
                    {helpCenterTexts.shippingInformation}
                </div>
                <div className={css.shippingAddressContainer}>
                    <div>Mary Smith</div>
                    <div>52 Washburn, San Francisco, CA, 94027</div>
                    <div>United States</div>
                </div>
                <div className={css.shippingCarrier}>
                    <img
                        className={css.shippingCarrierLogo}
                        src={uspsLogo}
                        alt=""
                    />
                    <div className={css.shippingCarrierContent}>
                        <div className={css.shippingCarrierTitle}>
                            {helpCenterTexts.deliveredVia} USPS
                        </div>
                        <div className={css.shippingCarrierSubtitle}>
                            {helpCenterTexts.trackOrderTrackingNo}{' '}
                            <span className={css.shippingCarrierTrackingNumber}>
                                654756
                                <i className="material-icons ml-1">launch</i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className={css.separator} />
            <div className={css.fulfillmentContainer}>
                <div className={css.fulfillmentTitle}>
                    {helpCenterTexts.fulfillmentTitle
                        .replace('{{current}}', '1')
                        .replace('{{total}}', '1')}
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

export default SelfServiceHelpCenterTrackPage
