import React, {useMemo} from 'react'
import {fromJS, List, Map} from 'immutable'

import {OneDimensionalChart, Stat} from '../../../../../../models/stat/types'

import KeyMetricStat from './KeyMetricStat'

type Props = {
    resourceStats: {
        resourceName: string
        stat: Stat<OneDimensionalChart> | null
        isFetching: boolean
    }[]
    config: Map<any, any>
}

// todo: Merge this component with KeyMetricStat during the refactoring KeyMetricStat
export default function MultiResourceKeyMetricStat({
    resourceStats,
    config,
}: Props) {
    const data = useMemo(() => {
        const data = resourceStats.map(({stat}) => stat?.data.data || {})
        return fromJS(data) as List<any>
    }, [resourceStats])

    const meta = useMemo(() => {
        const meta = resourceStats.find(({stat}) => stat?.meta) || {}
        return fromJS(meta) as Map<any, any>
    }, [resourceStats])

    const loading = useMemo(() => {
        const loading = resourceStats.reduce(
            (acc, {resourceName, isFetching}) => {
                return {
                    ...acc,
                    [resourceName]: isFetching,
                }
            },
            {}
        )
        return fromJS(loading) as Map<any, any>
    }, [resourceStats])

    return (
        <KeyMetricStat
            data={data}
            config={config}
            meta={meta}
            loading={loading}
        />
    )
}
