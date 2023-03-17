import React, {ReactNode, useMemo} from 'react'
import {Card, CardBody, CardTitle} from 'reactstrap'
import classnames from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import {ProductType, SMSOrVoicePrice} from 'models/billing/types'
import Button from 'pages/common/components/button/Button'
import LinkButton from 'pages/common/components/button/LinkButton'
import CurrentPlanBadge from 'pages/settings/billing/plans/CurrentPlanBadge'
import SubscriptionAmount from 'pages/settings/common/SubscriptionAmount'
import {
    getCurrentHelpdeskCurrency,
    getCurrentHelpdeskInterval,
    getCurrentHelpdeskName,
} from 'state/billing/selectors'
import {openChat} from 'utils'
import {convertLegacyPlanNameToPublicPlanName} from 'utils/paywalls'

import css from './AddOnCard.less'

const title = {
    [ProductType.Voice]: 'Voice',
    [ProductType.SMS]: 'SMS',
}

type Props = {
    addOnPrice?: SMSOrVoicePrice
    headerPriceAmount?: number
    className?: string
    name: ProductType.Voice | ProductType.SMS
    pricingDetailsLink: string
    nonSubscriberDescription: ReactNode
}

const TrialPricesInternalIds = new Set([
    'voc-addon-00-monthly-usd-4',
    'voc-addon-00-yearly-usd-4',
    'sms-addon-00-monthly-usd-4',
    'sms-addon-00-yearly-usd-4',
])

const FreePricesInternalIds = new Set([
    'voc-addon-free-monthly',
    'voc-addon-free-yearly',
    'sms-addon-free-monthly',
    'sms-addon-free-yearly',
])

const AddOnCard = ({
    addOnPrice,
    headerPriceAmount,
    name,
    nonSubscriberDescription,
    pricingDetailsLink,
    className,
}: Props) => {
    const currency = useAppSelector(getCurrentHelpdeskCurrency)
    const interval = useAppSelector(getCurrentHelpdeskInterval)
    const priceName = useAppSelector(getCurrentHelpdeskName)
    const formattedPriceName = convertLegacyPlanNameToPublicPlanName(
        priceName || ''
    )
    const isTrialPrice = useMemo(
        () => TrialPricesInternalIds.has(addOnPrice?.internal_id || ''),
        [addOnPrice]
    )
    const isFreePrice = useMemo(
        () => FreePricesInternalIds.has(addOnPrice?.internal_id || ''),
        [addOnPrice]
    )

    const extraTicketCost = isTrialPrice && addOnPrice?.extra_ticket_cost

    const hasAddOn = useMemo(
        () => !!addOnPrice && !isTrialPrice && !isFreePrice,
        [addOnPrice, isTrialPrice, isFreePrice]
    )

    return (
        <Card className={className}>
            <CardTitle
                className={classnames(css['card-title'], {
                    [css[formattedPriceName.toLowerCase()]]: hasAddOn,
                })}
            >
                <span className={css.title}>{title[name]}</span>
                {!hasAddOn && interval && (
                    <div className={css['subscription-amount-wrapper']}>
                        Starting at&nbsp;
                        <SubscriptionAmount
                            className={css['subscription-amount']}
                            currency={currency}
                            interval={interval}
                            amount={headerPriceAmount}
                            renderAmount={(amount) => <b>{amount}</b>}
                        />
                    </div>
                )}
            </CardTitle>
            <CardBody className={css['card-body']}>
                <div className={css.description}>
                    {hasAddOn ? (
                        <>
                            <CurrentPlanBadge className={css.badge} />
                            <div className={css.title}>
                                {`${new Intl.NumberFormat('en-US').format(
                                    addOnPrice!.num_quota_tickets
                                )} ${title[name]} Tickets`}
                            </div>
                        </>
                    ) : (
                        <>
                            <p>{nonSubscriberDescription}</p>
                            {isFreePrice ? (
                                <p>You’re currently on a free plan.</p>
                            ) : (
                                isTrialPrice && (
                                    <p>
                                        You’re currently paying{' '}
                                        <b>
                                            {!!extraTicketCost &&
                                                new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency,
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }).format(extraTicketCost)}
                                            /ticket
                                        </b>{' '}
                                        until you subscribe to a plan.
                                    </p>
                                )
                            )}
                        </>
                    )}
                </div>
                <div className={css.footer}>
                    {hasAddOn ? (
                        <Button
                            onClick={openChat}
                            className={css.button}
                            intent="secondary"
                        >
                            Manage
                        </Button>
                    ) : (
                        <>
                            <a
                                href={pricingDetailsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View pricing details
                            </a>
                            <LinkButton
                                intent="secondary"
                                href="http://gorgias.typeform.com/to/gH7HYEHu"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Subscribe
                            </LinkButton>
                        </>
                    )}
                </div>
            </CardBody>
        </Card>
    )
}

export default AddOnCard
