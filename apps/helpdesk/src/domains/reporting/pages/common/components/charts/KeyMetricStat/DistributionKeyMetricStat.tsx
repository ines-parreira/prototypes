import classnames from 'classnames'
import type { Map } from 'immutable'
import { rangeRight } from '@gorgias/toolkit'
import type { DistributionStatVariant } from 'domains/reporting/pages/common/components/charts/DistributionVariantStat'
import { DistributionVariantStat } from 'domains/reporting/pages/common/components/charts/DistributionVariantStat'
import css from 'domains/reporting/pages/common/components/charts/KeyMetricStat/DistributionKeyMetricStat.less'

type Props = {
    config: Map<any, any>
    formattedValue: Map<any, any>
}

export function DistributionKeyMetricStat({ config, formattedValue }: Props) {
    const maxValue = config.get('maxValue') as number
    const minValue = config.get('minValue') as number
    const variant = config.get('variant') as DistributionStatVariant

    return (
        <div>
            {rangeRight(minValue, maxValue + 1).map((index) => (
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
                            'ta-right',
                        )}
                    >
                        {formattedValue.get(index.toString())}
                    </div>
                </div>
            ))}
        </div>
    )
}
