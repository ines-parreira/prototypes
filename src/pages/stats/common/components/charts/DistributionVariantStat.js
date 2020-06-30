// @flow
import React, {Component} from 'react'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import _rangeRight from 'lodash/rangeRight'

import css from './DistributionVariantStat.less'
import fullStar from './../../../../../../img/satisfaction-survey/full-star.svg'
import emptyStar from './../../../../../../img/satisfaction-survey/empty-star.svg'

type Props = {
    minValue: number,
    maxValue: number,
    variant: string,
    currentValue: number,
}

export default class DistributionVariantStat extends Component<Props> {
    render = () => {
        const {minValue, maxValue, variant, currentValue} = this.props

        const VARIANTS = fromJS({
            star: {
                fill: (key) => (
                    <img
                        alt="filled star"
                        key={key}
                        src={fullStar}
                        className={css.star}
                    />
                ),
                empty: (key) => (
                    <img
                        alt="empty star"
                        key={key}
                        src={emptyStar}
                        className={css.star}
                    />
                ),
            },
            default: {
                fill: (key) => (
                    <i
                        key={key}
                        className={classNames(
                            'material-icons',
                            css[`${variant}-fill`]
                        )}
                    >
                        star_rate
                    </i>
                ),
                empty: (key) => (
                    <i
                        key={key}
                        className={classNames(
                            'material-icons',
                            css[`${variant}-empty`]
                        )}
                    >
                        star_rate
                    </i>
                ),
            },
        })

        const variantComponent = VARIANTS.get(variant, 'default')

        return (
            <span className={classNames(css.distribution)}>
                {_rangeRight(minValue, maxValue + 1).map((index) =>
                    index <= maxValue - currentValue
                        ? variantComponent.get('empty')(index)
                        : variantComponent.get('fill')(index)
                )}
            </span>
        )
    }
}
