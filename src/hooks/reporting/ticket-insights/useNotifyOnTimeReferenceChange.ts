import { useNotify } from 'hooks/useNotify'
import useUpdateEffect from 'hooks/useUpdateEffect'
import { TicketTimeReference } from 'models/stat/types'

const RESULTS_BASED_ON_ALL_STATUSES_NOTIFICATION =
    'results will now display based on all ticket statuses'
const RESULTS_BASED_ON_CREATION_DATE_NOTIFICATION =
    'results will now display based on ticket creation date'

const timeReferenceToNotificationMap = {
    [TicketTimeReference.TaggedAt]: RESULTS_BASED_ON_ALL_STATUSES_NOTIFICATION,
    [TicketTimeReference.CreatedAt]:
        RESULTS_BASED_ON_CREATION_DATE_NOTIFICATION,
}

export enum ReportName {
    Tags = 'tags',
    TicketFields = 'ticketFields',
}

export const createNotificationMessage = (
    reportName: ReportName,
    selection: TicketTimeReference,
) => {
    const notification = timeReferenceToNotificationMap[selection]

    return `${reportName} ${notification}`
}

export const useNotifyOnTimeReferenceChange = (
    reportName: ReportName,
    ticketTimeReference: TicketTimeReference,
) => {
    const notify = useNotify()

    useUpdateEffect(() => {
        const message = createNotificationMessage(
            reportName,
            ticketTimeReference,
        )

        notify.success(message)
    }, [notify, reportName, ticketTimeReference])
}
