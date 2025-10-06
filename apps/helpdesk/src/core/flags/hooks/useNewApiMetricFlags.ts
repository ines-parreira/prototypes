import useFlag from 'core/flags/hooks/useFlag'
import { resolveMetricFlag } from 'core/flags/utils/newApiMetricFlags'
import { MetricName } from 'domains/reporting/hooks/metricNames'

type MigrationMode = 'off' | 'shadow' | 'live' | 'complete'

export function useNewApiMetricFlags(name: MetricName): MigrationMode {
    const flag = resolveMetricFlag(name)
    return useFlag(flag, 'off')
}
