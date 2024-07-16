import React from 'react'
import {useLocation} from 'react-router-dom'
import moment from 'moment-timezone'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {useSearchParam} from 'hooks/useSearchParam'
import useWorkflowAnalyticsDisplayBanner from '../hooks/useWorkflowAnalyticsDisplayBanner'
import css from './WorkflowAnalytics.less'

interface WorkflowAnalyticsBannerProps {
    workflowUpdatedDatetime: string
    hasDataAvailable: boolean
}

const WorkflowAnalyticsBanner: React.FC<WorkflowAnalyticsBannerProps> = ({
    workflowUpdatedDatetime,
    hasDataAvailable,
}) => {
    const location = useLocation<{from?: string}>()
    const {from} = location.state || {}
    const [startDatetime] = useSearchParam('start_datetime')

    const {
        displayNoDataAvailableBanner,
        displayMultipleVersionsBanner,
        displayLegacyDataBanner,
        onClose,
    } = useWorkflowAnalyticsDisplayBanner({
        flowUpdateDatetime: workflowUpdatedDatetime,
        startDatetime: startDatetime ?? moment().format(),
        hasDataAvailable,
        previousRoute: from ?? '',
    })

    let message = ''

    if (displayNoDataAvailableBanner) {
        message =
            'Data will appear when at least 1 interaction is made with the latest version of your Flow.'
    } else if (displayMultipleVersionsBanner) {
        message =
            'The selected date range includes multiple versions of this Flow. The data here only reflects the most recent version. '
    } else if (displayLegacyDataBanner) {
        message =
            'You may notice a difference in the numbers below and those in the Performance by Feature report. The numbers below contain the most up-to-date data, while the other report uses a legacy data source.'
    }

    return message ? (
        <Alert
            className={css.workflowBanner}
            type={AlertType.Info}
            icon
            onClose={!displayNoDataAvailableBanner ? onClose : undefined}
        >
            {message}
            {displayMultipleVersionsBanner && (
                <a
                    href="https://link.gorgias.com/ma6"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn more
                </a>
            )}
        </Alert>
    ) : null
}

export default WorkflowAnalyticsBanner
