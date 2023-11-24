import {TicketMessageSourceType} from 'business/types/ticket'

export const useDrillDownData = () => {
    const data = [
        {
            ticket: {
                id: 1,
                subject:
                    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod, nobis.',
                description:
                    'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Illo dolor debitis libero, impedit recusandae temporibus ad quaerat iure quasi dicta.',
                channel: TicketMessageSourceType.Chat,
                isRead: true,
            },
            metricValue: 2,
            assignee: {
                id: 1,
                name: 'Agent name with long names that doesnt fit here',
            } as any,
            created: '2023-11-16T18:09:19.825626+00:00',
            contactReason:
                'Long category about contact reason to view the tooltip and truncate',
        },
        {
            ticket: {
                id: 2,
                subject: 'Some other task name.',
                description:
                    'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Illo dolor debitis libero, impedit recusandae temporibus ad quaerat iure quasi dicta.',
                channel: TicketMessageSourceType.FacebookMessage,
                isRead: false,
            },
            metricValue: 10,
            assignee: {
                id: 2,
                name: 'Agent name',
            } as any,
            created: '2023-11-16T18:05:15.824944+00:00',
            contactReason: 'Facebook feedback',
        },
        {
            ticket: {
                id: 3,
                subject: 'No reason task.',
                description:
                    'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Illo dolor debitis libero, impedit recusandae temporibus ad quaerat iure quasi dicta.',
                channel: TicketMessageSourceType.Api,
                isRead: false,
            },
            metricValue: 15,
            assignee: {
                id: 2,
                name: 'Agent name',
            } as any,
            created: '2023-11-22T14:11:34.609176+00:00',
            contactReason: null,
        },
    ]

    return {
        isFetching: false,
        perPage: 2,
        currentPage: 1,
        onPageChange: (page: number) => page,
        data,
    }
}
