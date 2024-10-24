import classnames from 'classnames'
import {Map} from 'immutable'
import _rangeRight from 'lodash/rangeRight'
import React from 'react'

import DistributionVariantStat, {
    DistributionStatVariant,
} from '../DistributionVariantStat'

import css from './DistributionKeyMetricStat.less'

type Props = {
    config: Map<any, any>
    formattedValue: Map<any, any>
}

export default function DistributionKeyMetricStat({
    config,
    formattedValue,
}: Props) {
    const maxValue = config.get('maxValue') as number
    const minValue = config.get('minValue') as number
    const variant = config.get('variant') as DistributionStatVariant

    return (
        <div>
            {_rangeRight(minValue, maxValue + 1).map((index) => (
                <div className={classnames('mb-1', 'row')} key={index}>
                    <div className="col-md-6 ta-left">
                        <DistributionVariantStat
                            minValue={minValue}
                            maxValue={maxValue}
                            variant={variant}
                            currentValue={index}
                        />
                    </div>

                    <div
                        className={classnames(
                            css.value,
                            'col-md-3',
                            'ta-right'
                        )}
                    >
                        {formattedValue.get(index.toString())}
                    </div>
                </div>
            ))}
        </div>
    )
}
