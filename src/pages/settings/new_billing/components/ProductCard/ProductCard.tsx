import React, {useCallback, useMemo} from 'react'
import classNames from 'classnames'
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

import {PRODUCT_INFO} from '../../constants'
import Badge, {BadgeType} from '../Badge/Badge'
import css from './ProductCard.less'

export type ProductCardProps = {
    type: ProductType
    product?: HelpdeskPrice | AutomationPrice | SMSOrVoicePrice
}

const ProductCard = ({type, product}: ProductCardProps) => {
    const cheapestPrices = useAppSelector(getCheapestProductPrices)
    const interval = useAppSelector(getCurrentHelpdeskInterval)

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

    const formatAmount = useCallback(
        (amount: number) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency ?? 'usd',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(amount)
        },
        [currency]
    )

    const currentStatus = useMemo(() => {
        if (!isActive) {
            return <Badge text="Inactive" type={BadgeType.Info} />
        }
        return (
            <>
                {type === ProductType.Helpdesk && <>{planName} - </>}
                <b>{formatAmount(price ?? 0)}</b>/{interval}
            </>
        )
    }, [formatAmount, interval, isActive, planName, price, type])

    const subscribeContainer = useMemo(() => {
        return (
            <div className={css.subscribeContainer}>
                <div>
                    Starting at{' '}
                    <b>{formatAmount(cheapestPrices[type]?.amount ?? 0)}</b>/
                    {interval}
                </div>
                <Button intent="primary">Subscribe</Button>
            </div>
        )
    }, [cheapestPrices, formatAmount, interval, type])

    const updateContainer = useMemo(
        () => <Button intent="secondary">Update Plan</Button>,
        []
    )

    const counter = useMemo(
        () => (
            <div className={classNames(css.counter)}>
                <>
                    290 of {product?.num_quota_tickets || 0}{' '}
                    {PRODUCT_INFO[type].counter}
                </>
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

        [product, type]
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
                <div data-candu-id={`billing-${type}-description`}></div>
            </div>
            <div className={css.footer}>
                <div>{isActive ? updateContainer : subscribeContainer}</div>
                {isActive && counter}
            </div>
        </div>
    )
}

export default ProductCard
