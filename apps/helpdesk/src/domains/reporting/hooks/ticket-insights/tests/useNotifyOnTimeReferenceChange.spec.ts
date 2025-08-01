import { assumeMock, renderHook } from '@repo/testing'

import {
    createNotificationMessage,
    ReportName,
    useNotifyOnTimeReferenceChange,
} from 'domains/reporting/hooks/ticket-insights/useNotifyOnTimeReferenceChange'
import { TicketTimeReference } from 'domains/reporting/models/stat/types'
import { useNotify } from 'hooks/useNotify'

jest.mock('hooks/useNotify')
const useNotifyMock = assumeMock(useNotify)

describe('useNotifyOnTimeReferenceChange', () => {
    const mockSuccess = jest.fn()
    useNotifyMock.mockReturnValue({
        success: mockSuccess,
    } as any)

    it('should notify when time reference changes to TaggedAt', () => {
        const { rerender } = renderHook(
            ({ timeRef }) =>
                useNotifyOnTimeReferenceChange(ReportName.Tags, timeRef),
            {
                initialProps: { timeRef: TicketTimeReference.CreatedAt },
            },
        )

        rerender({ timeRef: TicketTimeReference.TaggedAt })

        expect(mockSuccess).toHaveBeenCalledWith(
            createNotificationMessage(
                ReportName.Tags,
                TicketTimeReference.TaggedAt,
            ),
        )
    })

    it('should notify when time reference changes to CreatedAt', () => {
        const { rerender } = renderHook(
            ({ timeRef }) =>
                useNotifyOnTimeReferenceChange(
                    ReportName.TicketFields,
                    timeRef,
                ),
            {
                initialProps: { timeRef: TicketTimeReference.TaggedAt },
            },
        )

        rerender({ timeRef: TicketTimeReference.CreatedAt })

        expect(mockSuccess).toHaveBeenCalledWith(
            createNotificationMessage(
                ReportName.TicketFields,
                TicketTimeReference.CreatedAt,
            ),
        )
    })

    it('should not notify on initial mount', () => {
        renderHook(() =>
            useNotifyOnTimeReferenceChange(
                ReportName.TicketFields,
                TicketTimeReference.CreatedAt,
            ),
        )

        expect(mockSuccess).not.toHaveBeenCalled()
    })
})
