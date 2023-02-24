import React from 'react'
import classnames from 'classnames'

import {HelpCenter} from 'models/helpCenter/types'
import {HELP_CENTER_TEXTS} from 'config/helpCenter'

import useOrderDates from './hooks/useOrderDates'
import {useSelfServicePreviewContext} from './SelfServicePreviewContext'
import {LINE_ITEMS} from './constants'

import css from './SelfServiceHelpCenterCancelPage.less'

type Props = {
    helpCenter: HelpCenter
}

const SelfServiceHelpCenterCancelPage = ({helpCenter}: Props) => {
    const helpCenterTexts = HELP_CENTER_TEXTS[helpCenter.default_locale]

    const {automatedResponseMessageContent} = useSelfServicePreviewContext()
    const {orderPlacedDate} = useOrderDates(helpCenter.default_locale)

    return (
        <div className={css.container}>
            <div className={css.header}>
                <i
                    className={classnames(
                        'material-icons',
                        css.checkCircleIcon
                    )}
                >
                    check_circle
                </i>
                <div className={css.titleWithDescriptionContainer}>
                    <div className={css.title}>
                        {helpCenterTexts.completedFlowTitle}
                    </div>
                    {!!automatedResponseMessageContent?.text?.length && (
                        <div
                            className={css.automatedResponse}
                            dangerouslySetInnerHTML={{
                                __html: automatedResponseMessageContent.html,
                            }}
                        />
                    )}
                    <div className={css.description}>
                        {helpCenterTexts.weWillGetBackToYouViaEmail}
                    </div>
                </div>
            </div>
            <div className={css.summaryContainer}>
                <div className={css.summaryTitle}>
                    {helpCenterTexts.completedFlowSummaryTitle}
                </div>
                <div className={css.summaryContent}>
                    <div className={css.orderDetails}>
                        <div className={css.orderDetailsTitle}>
                            {helpCenterTexts.orderNumber.replace(
                                '{{orderNumber}}',
                                '#3089'
                            )}
                        </div>
                        <div className={css.orderDetailsDescription}>
                            <div>
                                {helpCenterTexts.totalCanceledAmountLabel}{' '}
                                <b>$20.00</b>
                            </div>
                            <div>
                                {helpCenterTexts.orderCreatedLabel}{' '}
                                <b>{orderPlacedDate.format('L HH:mm')}</b>
                            </div>
                            <div>
                                {helpCenterTexts.shippingAddressLabel}{' '}
                                <b>52 Washburn, San Francisco, CA, 94027</b>
                            </div>
                        </div>
                    </div>
                    <div className={css.fulfillmentLineItems}>
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
        </div>
    )
}

export default SelfServiceHelpCenterCancelPage
