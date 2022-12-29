import {
    SelfServiceConfiguration,
    SelfServiceConfiguration_DEPRECATED,
    SelfServiceReportIssueCase,
} from './types'

export const selfServiceConfigurationFromDeprecated = (
    configuration: SelfServiceConfiguration_DEPRECATED
): SelfServiceConfiguration => ({
    ...configuration,
    report_issue_policy: {
        ...configuration.report_issue_policy,
        cases: configuration.report_issue_policy.cases.map(
            ({reasons, newReasons, ...rest}): SelfServiceReportIssueCase => ({
                ...rest,
                reasons:
                    newReasons ??
                    reasons.map((reasonKey) => ({
                        reasonKey,
                        action: undefined,
                    })),
            })
        ),
    },
})
