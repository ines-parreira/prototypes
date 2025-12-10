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

    it('should return the correct flag for P2 metrics', () => {
        expect(
            resolveMetricFlag(
                METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_RECEIVED,
            ),
        ).toBe(FeatureFlagKey.ReportingP2MetricMigration)
    })

    it('should return the correct flag for ticket fields P2 metric', () => {
        expect(
            resolveMetricFlag(
                METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT,
            ),
        ).toBe(FeatureFlagKey.ReportingP2MetricMigration)
    })

    it('should return the correct flag for non-migrated metrics', () => {
        expect(
            resolveMetricFlag(
                METRIC_NAMES.CONVERT_CAMPAIGN_ORDER_PERFORMANCE_DRILL_DOWN,
            ),
        ).toBe(FeatureFlagKey.ReportingUnsortedMetricMigration)
    })
})
