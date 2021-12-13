import React, {Component, ReactNode} from 'react'
import classNames from 'classnames'
import {fromJS, Map} from 'immutable'
import _rangeRight from 'lodash/rangeRight'

import fullStar from 'assets/img/satisfaction-survey/full-star.svg'
import emptyStar from 'assets/img/satisfaction-survey/empty-star.svg'

import css from './DistributionVariantStat.less'

type Props = {
    minValue: number
    maxValue: number
    variant: string
    currentValue: number
}

export default class DistributionVariantStat extends Component<Props> {
    render() {
        const {minValue, maxValue, variant, currentValue} = this.props

        const VARIANTS: Map<any, any> = fromJS({
            star: {
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
            },
            default: {
                fill: (key: number) => (
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
                empty: (key: number) => (
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

        const variantComponent = VARIANTS.get(variant, 'default') as Map<
            any,
            any
        >

        return (
            <span className={classNames(css.distribution)}>
                {_rangeRight(minValue, maxValue + 1).map((index) =>
                    index <= maxValue - currentValue
                        ? (
                              variantComponent.get('empty') as (
                                  key: number
                              ) => ReactNode
                          )(index)
                        : (
                              variantComponent.get('fill') as (
                                  key: number
                              ) => ReactNode
                          )(index)
                )}
            </span>
        )
    }
}
