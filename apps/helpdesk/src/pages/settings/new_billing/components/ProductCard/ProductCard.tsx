import React, { useMemo } from 'react'

import classNames from 'classnames'
import { useHistory } from 'react-router-dom'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import { Plan, ProductType } from 'models/billing/types'
import {
    getOverageUnitPriceFormatted,
    getPlanPriceFormatted,
    isConvert,
    isEnterprise,
    isLegacyAutomate,
    isTrial,
} from 'models/billing/utils'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import {
    getCheapestProductPrices,
    getCurrentHelpdeskCadence,
} from 'state/billing/selectors'
import { BillingBanner, CurrentUsagePerProduct } from 'state/billing/types'

import { BILLING_PROCESS_PATH, PRODUCT_INFO } from '../../constants'
import { formatAmount, formatNumTickets } from '../../utils/formatAmount'
import Badge, { BadgeType } from '../Badge/Badge'

import css from './ProductCard.less'

export type ProductCardProps = {
    type: ProductType
    plan?: Plan | null
    usage?: CurrentUsagePerProduct | null
    banner?: BillingBanner | null
    isDisabled: boolean
    disabledTooltip?: string
    autoUpgradeEnabled?: boolean | null
}

const ProductCard = ({
    type,
    plan,
    usage,
    banner,
    isDisabled,
    disabledTooltip,
    autoUpgradeEnabled = false,
}: ProductCardProps) => {
    const cheapestPlanByProduct = useAppSelector(getCheapestProductPrices)
    const cadence = useAppSelector(getCurrentHelpdeskCadence)
    const history = useHistory()

    const { className, canduOverageStatus } = useMemo(() => {
        if (
            !usage ||
            !plan?.num_quota_tickets ||
            usage.data.num_tickets < 0.8 * (plan?.num_quota_tickets || 0)
        ) {
            return {
                className: '',
                canduOverageStatus: 'info',
            }
        }

        if (usage.data.num_tickets < (plan?.num_quota_tickets || 0)) {
            return {
                className: css.warning,
                canduOverageStatus: 'warning',
            }
        }

        return {
            className: css.danger,
            canduOverageStatus: 'danger',
        }
    }, [usage, plan])

    const currentStatus = useMemo(() => {
        if (!plan) {
            return null
        }

        if (plan && isTrial(plan)) {
            return (
                <>
                    <strong>{getOverageUnitPriceFormatted(plan)}</strong>{' '}
                    {PRODUCT_INFO[type].perTicket}
                </>
            )
        }

        return (
            <>
                {type === ProductType.Helpdesk && <>{plan.name} - </>}
                <b>{getPlanPriceFormatted(plan)}</b>/{plan.cadence}
            </>
        )
    }, [plan, type])

    const subscribeContainer = useMemo(() => {
        return (
            <div className={css.subscribeContainer}>
                {cadence && (
                    <div>
                        Starting at{' '}
                        <b>
                            {getPlanPriceFormatted(cheapestPlanByProduct[type])}
                        </b>
                        /{cadence}
                    </div>
                )}
                {isDisabled && disabledTooltip && (
                    <Tooltip
                        placement="top"
                        target={`productCardButton_${type}`}
                    >
                        {disabledTooltip}
                    </Tooltip>
                )}
                <Button
                    intent="primary"
                    isDisabled={isDisabled}
                    onClick={() =>
                        history.push(`${BILLING_PROCESS_PATH}/${type}`)
                    }
                    id={`productCardButton_${type}`}
                >
                    {isDisabled && (
                        <i
                            className={classNames(
                                'material-icons',
                                css.disabledLock,
                            )}
                        >
                            lock
                        </i>
                    )}
                    Subscribe
                </Button>
            </div>
        )
    }, [
        cheapestPlanByProduct,
        type,
        cadence,
        history,
        isDisabled,
        disabledTooltip,
    ])

    const updateContainer = useMemo(
        () => (
            <Button
                intent="secondary"
                onClick={() => history.push(`${BILLING_PROCESS_PATH}/${type}`)}
                id={`productCardButton_${type}`}
            >
                Manage
            </Button>
        ),
        [history, type],
    )

    const counter = useMemo(() => {
        if (plan && isLegacyAutomate(plan)) {
            return null
        }

        return (
            <div className={classNames(css.counter)}>
                {plan && isTrial(plan) ? (
                    <div className={className}>
                        {usage ? formatNumTickets(usage.data.num_tickets) : 0}{' '}
                        {PRODUCT_INFO[type].counter} used
                    </div>
                ) : (
                    <div className={className}>
                        {usage ? formatNumTickets(usage.data.num_tickets) : 0}{' '}
                        of {formatNumTickets(plan?.num_quota_tickets || 0)}{' '}
                        {PRODUCT_INFO[type].counter} used
                    </div>
                )}
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
        )
    }, [plan, type, usage, className])

    const extraCost = useMemo(() => {
        if (plan && (isLegacyAutomate(plan) || isConvert(plan))) {
            return null
        }

        return (
            <div className={css.extraCost}>
                {formatAmount(
                    (usage?.data.extra_tickets_cost_in_cents ?? 0) / 100,
                )}{' '}
                extra cost
            </div>
        )
    }, [plan, usage])

    return (
        <div className={css.container}>
            <div className={css.header}>
                <div className={css.title}>
                    <i
                        className={classNames('material-icons', {
                            [css.activeIcon]: !!plan,
                        })}
                    >
                        {PRODUCT_INFO[type].icon}
                    </i>
                    <div>{PRODUCT_INFO[type].title}</div>
                    {!!plan ? (
                        <Badge text="Active" type={BadgeType.Success} />
                    ) : (
                        <Badge text="Inactive" type={BadgeType.Info} />
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
                            type={banner.type}
                            customActions={
                                banner.type === AlertType.Info && (
                                    <a
                                        href={PRODUCT_INFO[type].bannerLink}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Set up {PRODUCT_INFO[type].title}
                                    </a>
                                )
                            }
                        >
                            {banner.description}
                        </Alert>
                    )}
                </div>
            </div>
            <div className={css.footer}>
                <div>{!!plan ? updateContainer : subscribeContainer}</div>
                <div>
                    {!!plan && counter}

                    {plan && isConvert(plan) && !isEnterprise(plan) ? (
                        <div className={css.autoUpgradeLabel}>
                            Auto-upgrade
                            {autoUpgradeEnabled ? ' enabled ' : ' disabled '}
                            <a
                                href="https://link.gorgias.com/5015d3"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Learn more
                            </a>
                        </div>
                    ) : (
                        <>{!!plan && extraCost}</>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductCard
