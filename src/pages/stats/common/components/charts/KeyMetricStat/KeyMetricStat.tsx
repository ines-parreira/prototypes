import React, {ComponentProps} from 'react'
import {Map, List} from 'immutable'

import {KeyMetricCell} from './KeyMetricCell'

import css from './KeyMetricStat.less'

type Props = {
    data: List<any>
    config: Map<any, any>
    meta: Map<any, any>
    loading: boolean | Map<any, any>
}

const KeyMetricStat = ({data, config, meta, loading}: Props) => {
    return (
        <div className={css.metrics}>
            {(config.get('metrics') as List<any>).map(
                (metricConfig: Map<any, any>, index) => {
                    const metricName = (metricConfig.get('api_resource_name') ||
                        metricConfig.get('name')) as string

                    const id = `${metricName}-${index!}`
                    const props: ComponentProps<typeof KeyMetricCell> = {
                        metricConfig,
                        data,
                        loading,
                        index: index!,
                        meta,
                        id,
                    }

                    const Component = metricConfig.get('component')
                    if (Component) return <Component key={id} {...props} />

                    return <KeyMetricCell key={id} {...props} />
                }
            )}
        </div>
    )
}

export default KeyMetricStat
