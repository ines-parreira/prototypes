import React, {useMemo} from 'react'
import classNames from 'classnames'
import {useHistory} from 'react-router-dom'
import {
    AutomationPrice,
    HelpdeskPrice,
    ProductType,
    SMSOrVoicePrice,
} from 'models/billing/types'

import Button from 'pages/common/components/button/Button'
import Tooltip from 'pages/common/components/Tooltip'
import useAppSelector from 'hooks/useAppSelector'
import {
    getCheapestProductPrices,
    getCurrentHelpdeskInterval,
} from 'state/billing/selectors'
import {CurrentUsagePerProduct} from 'state/billing/types'

import Alert from 'pages/common/components/Alert/Alert'
import {BILLING_PROCESS_PATH, PRODUCT_INFO} from '../../constants'
import Badge, {BadgeType} from '../Badge/Badge'
import {formatAmount, formatNumTickets} from '../../utils/formatAmount'
import css from './ProductCard.less'

export type ProductCardProps = {
    type: ProductType
    product?: HelpdeskPrice | AutomationPrice | SMSOrVoicePrice
    usage?: CurrentUsagePerProduct | null
    banner?: string
}

const ProductCard = ({type, product, usage, banner = ''}: ProductCardProps) => {
    const cheapestPrices = useAppSelector(getCheapestProductPrices)
    const interval = useAppSelector(getCurrentHelpdeskInterval)
    const history = useHistory()

    const {className, canduOverageStatus} = useMemo(() => {
        if (
            !usage ||
            usage.data.num_tickets < 0.8 * (product?.num_quota_tickets || 0)
        ) {
            return {
                className: '',
                canduOverageStatus: 'info',
            }
        }

        if (usage.data.num_tickets < (product?.num_quota_tickets || 0)) {
            return {
                className: css.warning,
                canduOverageStatus: 'warning',
            }
        }

        return {
            className: css.danger,
            canduOverageStatus: 'danger',
        }
    }, [usage, product])

    const {isActive, price, currency, planName} = useMemo(() => {
        if (!product) {
            return {
                isActive: false,
                price: null,
                currency: null,
                planName: null,
            }
        }
        return {
            isActive: !!product,
            price: product.amount / 100,
            currency: product.currency,
            planName: product.name,
        }
    }, [product])

    const currentStatus = useMemo(() => {
        if (!isActive) {
            return <Badge text="Inactive" type={BadgeType.Info} />
        }
        return (
            <>
                {type === ProductType.Helpdesk && <>{planName} - </>}
                <b>{formatAmount(price ?? 0, currency)}</b>/{interval}
            </>
        )
    }, [interval, isActive, planName, price, currency, type])

    const subscribeContainer = useMemo(() => {
        return (
            <div className={css.subscribeContainer}>
                <div>
                    Starting at{' '}
                    <b>
                        {formatAmount(
                            (cheapestPrices[type]?.amount ?? 0) / 100,
                            currency
                        )}
                    </b>
                    /{interval}
                </div>
                <Button
                    intent="primary"
                    onClick={() =>
                        history.push(`${BILLING_PROCESS_PATH}/${type}`)
                    }
                >
                    Subscribe
                </Button>
            </div>
        )
    }, [cheapestPrices, type, currency, interval, history])

    const updateContainer = useMemo(
        () => (
            <Button
                intent="secondary"
                onClick={() => history.push(`${BILLING_PROCESS_PATH}/${type}`)}
            >
                Update Plan
            </Button>
        ),
        [history, type]
    )

    const counter = useMemo(
        () => (
            <div className={classNames(css.counter)}>
                <div className={className}>
                    {usage ? usage.data.num_tickets : 0} of{' '}
                    {formatNumTickets(product?.num_quota_tickets || 0)}{' '}
                    {PRODUCT_INFO[type].counter} used
                </div>
                <i className="material-icons" id={`info_${type}`}>
                    info_outlined
                </i>
                <Tooltip
                    target={`info_${type}`}
                    placement="top-start"
                    className={css.tooltip}
                    autohide={false}
                >
                    {PRODUCT_INFO[type].tooltip}
                    <a
                        href={PRODUCT_INFO[type].tooltipLink}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Learn more
                    </a>
                </Tooltip>
            </div>
        ),

        [product, type, usage, className]
    )

    return (
        <div className={css.container}>
            <div className={css.header}>
                <div className={css.title}>
                    <i
                        className={classNames('material-icons', {
                            [css.activeIcon]: isActive,
                        })}
                    >
                        {PRODUCT_INFO[type].icon}
                    </i>
                    <div>{PRODUCT_INFO[type].title}</div>
                    {isActive && (
                        <Badge text="Active" type={BadgeType.Success} />
                    )}
                </div>
                <div>{currentStatus}</div>
            </div>
            <div className={css.body}>
                <div
                    data-candu-id={`billing-${type}-description-${canduOverageStatus}`}
                >
                    {banner && (
                        <Alert
                            icon
                            customActions={
                                <a href={PRODUCT_INFO[type].bannerLink}>
                                    Set up {PRODUCT_INFO[type].title}
                                </a>
                            }
                        >
                            {banner}
                        </Alert>
                    )}
                </div>
            </div>
            <div className={css.footer}>
                <div>{isActive ? updateContainer : subscribeContainer}</div>
                {isActive && counter}
            </div>
        </div>
    )
}

export default ProductCard
