import React, {ReactNode} from 'react'
import classNames from 'classnames'
import {Card, CardBody, CardFooter, CardHeader} from 'reactstrap'

import css from './PlanCard.less'

export enum PlanCardTheme {
    Grey = 'Grey',
    Blue = 'Blue',
    Navy = 'Navy',
    Green = 'Green',
    Gold = 'Gold',
}

export type PlanCardFeature = {
    icon: ReactNode
    label: ReactNode
    isDisabled?: boolean
}

type Props = {
    planName: string
    theme?: PlanCardTheme
    features: PlanCardFeature[]
    price?: string
    headerBadge?: ReactNode
    footer?: ReactNode
    className?: string
    renderBody?: (featureList: ReactNode) => ReactNode
}

export default function PlanCard({
    planName,
    theme = PlanCardTheme.Grey,
    headerBadge,
    features,
    price,
    footer,
    className,
    renderBody = (featureList) => featureList,
}: Props) {
    return (
        <Card
            className={classNames(
                css.plan,
                {
                    [css.greyTheme]: theme === PlanCardTheme.Grey,
                    [css.blueTheme]: theme === PlanCardTheme.Blue,
                    [css.navyTheme]: theme === PlanCardTheme.Navy,
                    [css.greenTheme]: theme === PlanCardTheme.Green,
                    [css.goldTheme]: theme === PlanCardTheme.Gold,
                },
                className
            )}
            outline
        >
            <CardHeader className={css.planHeader}>
                {headerBadge && <div>{headerBadge}</div>}
                <div className={css.headerText}>
                    <strong>{planName}</strong>
                    {price && <span className={css.headerPrice}>{price}</span>}
                </div>
            </CardHeader>
            <CardBody className={css.cardBody}>
                {renderBody(
                    <ul className={css.featureList}>
                        {features.map((feature, i) => {
                            return (
                                <li
                                    key={`${planName}-feature-${i}`}
                                    className={classNames(
                                        'd-flex align-items-center',
                                        css.featureListItem,
                                        feature.isDisabled &&
                                            css.disabledFeatureListItem
                                    )}
                                >
                                    <span
                                        className={classNames(
                                            css.featureIcon,
                                            'mr-3'
                                        )}
                                    >
                                        {feature.icon}
                                    </span>
                                    <span>{feature.label}</span>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </CardBody>
            {footer && (
                <CardFooter className={css.cardFooter}>{footer}</CardFooter>
            )}
        </Card>
    )
}
