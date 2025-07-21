import classNames from 'classnames'
import _rangeRight from 'lodash/rangeRight'

import emptyStar from 'assets/img/satisfaction-survey/empty-star.svg'
import fullStar from 'assets/img/satisfaction-survey/full-star.svg'
import css from 'domains/reporting/pages/common/components/charts/DistributionVariantStat.less'

type Props = {
    minValue: number
    maxValue: number
    variant: DistributionStatVariant
    currentValue: number
}

export enum DistributionStatVariant {
    Default = 'default',
    Star = 'star',
}

const getVariant = (variant: DistributionStatVariant) => {
    switch (variant) {
        case DistributionStatVariant.Star:
            return {
                fill: (key: number) => (
                    <img
                        alt="filled star"
                        key={key}
                        src={fullStar}
                        className={css.star}
                    />
                ),
                empty: (key: number) => (
                    <img
                        alt="empty star"
                        key={key}
                        src={emptyStar}
                        className={css.star}
                    />
                ),
            }
        case DistributionStatVariant.Default:
            return {
                fill: (key: number) => (
                    <i
                        key={key}
                        className={classNames(
                            'material-icons',
                            css[`${variant}-fill`],
                        )}
                    >
                        star_rate
                    </i>
                ),
                empty: (key: number) => (
                    <i
                        key={key}
                        className={classNames(
                            'material-icons',
                            css[`${variant}-empty`],
                        )}
                    >
                        star_rate
                    </i>
                ),
            }
    }
}

export default function DistributionVariantStat({
    currentValue,
    maxValue,
    minValue,
    variant,
}: Props) {
    const variantComponent = getVariant(variant)

    return (
        <span className={classNames(css.distribution)}>
            {_rangeRight(minValue, maxValue + 1).map((index) =>
                index <= maxValue - currentValue
                    ? variantComponent.empty(index)
                    : variantComponent.fill(index),
            )}
        </span>
    )
}
