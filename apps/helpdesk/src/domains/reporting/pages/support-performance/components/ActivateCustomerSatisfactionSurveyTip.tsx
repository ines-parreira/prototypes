import { Link } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import MetricTip from 'domains/reporting/pages/support-performance/components/MetricTip'

export const SATISFACTION_SURVEYS_SETTINGS_PATH =
    '/app/settings/satisfaction-surveys'
export const CSAT_CTA =
    'Configure CSAT to get insight into your support quality.'
export const CONFIGURE_SATISFACTION_SURVEY_BUTTON =
    'Configure satisfaction survey'

export const ActivateCustomerSatisfactionSurveyTip = () => {
    return (
        <MetricTip title={'No data available'}>
            <div>
                <p>{CSAT_CTA}</p>
                <Link to={SATISFACTION_SURVEYS_SETTINGS_PATH}>
                    <Button intent={'secondary'} size={'small'}>
                        {CONFIGURE_SATISFACTION_SURVEY_BUTTON}
                    </Button>
                </Link>
            </div>
        </MetricTip>
    )
}
