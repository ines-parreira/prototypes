import React, {ReactNode, useMemo} from 'react'
import {Card, CardBody, CardTitle} from 'reactstrap'
import classnames from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import {ProductType, SMSPrice, VoicePrice} from 'models/billing/types'
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
    addOnPrice?: SMSPrice | VoicePrice
    headerPriceAmount?: number
    className?: string
    name: ProductType.Voice | ProductType.SMS
    pricingDetailsLink: string
    nonSubscriberDescription: ReactNode
}

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

    const hasAddOn = useMemo(() => !!addOnPrice, [addOnPrice])

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
                                    addOnPrice!.included_tickets
                                )} ${title[name]} Tickets`}
                            </div>
                        </>
                    ) : (
                        <>
                            <p>{nonSubscriberDescription}</p>
                            <p>
                                You’re currently on{' '}
                                <a
                                    href="https://www.gorgias.com/pricing"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    trial pricing
                                </a>{' '}
                                until you add a plan.
                            </p>
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
