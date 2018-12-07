// @flow
import React, {Component} from 'react'
import classnames from 'classnames'
import _rangeRight from 'lodash/rangeRight'
import DistributionVariantStat from '../DistributionVariantStat'

import css from './DistributionKeyMetricStat.less'

type Props = {
    config: Object,
    formattedValue: Object
}

export default class DistributionKeyMetricStat extends Component<Props> {
    static defaultProps = {}

    render() {
        const {config, formattedValue} = this.props
        const maxValue = config.get('maxValue')
        const minValue = config.get('minValue')
        const variant = config.get('variant')

        return <div>
            {
                _rangeRight(minValue, maxValue + 1).map((index) => (
                    <div
                        className={classnames('mb-1', 'row')}
                        key={index}
                    >
                        <div className='col-md-6 ta-left'>
                            <DistributionVariantStat
                                minValue={minValue}
                                maxValue={maxValue}
                                variant={variant}
                                currentValue={index}
                            />
                        </div>

                        <div className={classnames(css.value, 'col-md-3', 'ta-right')}>
                            {formattedValue.get(index.toString())}
                        </div>
                    </div>
                ))
            }
        </div>
    }
}
