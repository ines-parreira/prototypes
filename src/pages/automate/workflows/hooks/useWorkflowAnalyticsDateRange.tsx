import {useState, useEffect} from 'react'
import {Period} from 'models/stat/types'

interface UseWorkflowAnalyticsDateRangeProps extends Period {
    flow_update_datetime?: string
}

const useWorkflowAnalyticsDateRange = ({
    start_datetime,
    end_datetime,
    flow_update_datetime,
}: UseWorkflowAnalyticsDateRangeProps): Period => {
    const [adjustedStartDate, setAdjustedStartDate] =
        useState<string>(start_datetime)
    const [adjustedEndDate, setAdjustedEndDate] = useState<string>(end_datetime)

    useEffect(() => {
        if (!flow_update_datetime) {
            setAdjustedStartDate(start_datetime)
            setAdjustedEndDate(end_datetime)
            return
        }

        const flowUpdateDate = new Date(flow_update_datetime)
        const startDate = new Date(start_datetime)
        const endDate = new Date(end_datetime)
        const today = new Date()

        if (flowUpdateDate < startDate) {
            setAdjustedStartDate(start_datetime)
            setAdjustedEndDate(end_datetime)
        } else if (flowUpdateDate > startDate && flowUpdateDate < endDate) {
            setAdjustedStartDate(flow_update_datetime)
            setAdjustedEndDate(end_datetime)
        } else if (flowUpdateDate > endDate) {
            setAdjustedStartDate(flow_update_datetime)
            setAdjustedEndDate(today.toISOString().split('T')[0])
        } else {
            const last7Days = new Date()
            last7Days.setDate(last7Days.getDate() - 7)
            setAdjustedStartDate(last7Days.toISOString().split('T')[0])
            setAdjustedEndDate(today.toISOString().split('T')[0])
        }
    }, [flow_update_datetime, start_datetime, end_datetime])

    return {start_datetime: adjustedStartDate, end_datetime: adjustedEndDate}
}

export default useWorkflowAnalyticsDateRange
