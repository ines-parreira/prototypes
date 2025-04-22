import { useNotify } from 'hooks/useNotify'
import useUpdateEffect from 'hooks/useUpdateEffect'
import { TicketTimeReference } from 'models/stat/types'

export enum ReportName {
    Tags = 'tags',
    TicketFields = 'ticketFields',
}

const timeReferenceNotificationMessages: Record<
    ReportName,
    Record<TicketTimeReference, string>
> = {
    [ReportName.Tags]: {
        [TicketTimeReference.TaggedAt]:
            'Tag results will now display based on all ticket statuses.',
        [TicketTimeReference.CreatedAt]:
            'Tag results will now display based on when tag was applied.',
    },
    [ReportName.TicketFields]: {
        [TicketTimeReference.TaggedAt]:
            'Ticket Field results will now display based on all ticket statuses.',
        [TicketTimeReference.CreatedAt]:
            'Ticket Field results will now display based on when ticket field was applied.',
    },
}

export const createNotificationMessage = (
    reportName: ReportName,
    selection: TicketTimeReference,
) => timeReferenceNotificationMessages[reportName][selection]

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
