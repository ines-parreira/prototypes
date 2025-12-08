import { FeatureFlagKey } from '@repo/feature-flags'

import {
    P1_SCOPES,
    resolveMetricFlag,
} from 'core/flags/utils/newApiMetricFlags'
import {
    METRIC_NAMES,
    METRIC_NAMES_BY_SCOPE,
} from 'domains/reporting/hooks/metricNames'

describe('resolveMetricFlag', () => {
    it('should return the correct flag P1 metrics', () => {
        expect(resolveMetricFlag(METRIC_NAMES_BY_SCOPE[P1_SCOPES[0]][0])).toBe(
            FeatureFlagKey.ReportingP1MetricMigration,
        )

        expect(
            resolveMetricFlag(METRIC_NAMES.AGENTXP_TICKET_AVERAGE_HANDLE_TIME),
        ).toBe(FeatureFlagKey.ReportingP1MetricMigration)
    })

    // Skip this test as we don't have any P2 scopes yet
    it.skip('should return the correct flag for P2 metrics', () => {
        expect(resolveMetricFlag(METRIC_NAMES.SATISFACTION_AVERAGE_SCORE)).toBe(
            FeatureFlagKey.ReportingP2MetricMigration,
        )
    })

    it('should return the correct flag for P2 metrics', () => {
        expect(
            resolveMetricFlag(METRIC_NAMES.TICKET_INSIGHTS_TAGGED_TICKET_COUNT),
        ).toBe(FeatureFlagKey.ReportingUnsortedMetricMigration)
    })
})
