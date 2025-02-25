import React from 'react'

import classnames from 'classnames'

import { HELP_CENTER_TEXTS } from 'config/helpCenter'
import { HelpCenter } from 'models/helpCenter/types'

import { LINE_ITEMS } from './constants'
import useOrderDates from './hooks/useOrderDates'
import { useSelfServicePreviewContext } from './SelfServicePreviewContext'

import css from './SelfServiceHelpCenterTrackPage.less'

type Props = {
    helpCenter: HelpCenter
}

const SelfServiceHelpCenterTrackUnfulfillResponsePage = ({
    helpCenter,
}: Props) => {
    const helpCenterTexts = HELP_CENTER_TEXTS[helpCenter.default_locale]

    const { automatedResponseMessageContent } = useSelfServicePreviewContext()

    const { etaDate, orderPlacedDate, inTransitDate } = useOrderDates(
        helpCenter.default_locale,
    )

    return (
        <div className={css.container}>
            <div className={css.header}>
                <div className={css.orderNumber}>
                    {helpCenterTexts.orderNumber.replace(
                        '{{orderNumber}}',
                        '#3089',
                    )}
                </div>
                <div className={css.orderDate}>
                    {orderPlacedDate.format('L')}
                </div>
            </div>
            <div className={css.etaWithTimelineContainer}>
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
                                        {helpCenterTexts.checkpointOrderPlaced}
                                    </div>
                                    <div className={css.timelineItemTimestamp}>
                                        {inTransitDate.format('L - hh:mm a')}
                                    </div>
                                </div>
                                <div className={css.timelineItemDescription}>
                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                automatedResponseMessageContent?.html ||
                                                '',
                                        }}
                                    ></p>
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
                                    {helpCenterTexts.confirmed}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={css.timelineLastUpdated}>
                        {helpCenterTexts.lastUpdated}{' '}
                        {etaDate
                            .clone()
                            .subtract(2, 'hours')
                            .from(etaDate.clone())}
                    </div>
                </div>
            </div>
            <div className={css.separator} />
            <div className={css.shippingContainer}>
                <div className={css.shippingHeader}>
                    {helpCenterTexts.trackOrderShippingAddress}
                </div>
                <div className={css.shippingAddressContainer}>
                    <div>Mary Smith</div>
                    <div>52 Washburn, San Francisco, CA, 94027</div>
                    <div>United States</div>
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

export default SelfServiceHelpCenterTrackUnfulfillResponsePage
