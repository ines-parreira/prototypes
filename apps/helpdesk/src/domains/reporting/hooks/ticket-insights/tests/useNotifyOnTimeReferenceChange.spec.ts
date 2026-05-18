import { renderHook } from '@repo/testing'
import { screen } from '@testing-library/react'

import {
    createNotificationMessage,
    ReportName,
    useNotifyOnTimeReferenceChange,
} from 'domains/reporting/hooks/ticket-insights/useNotifyOnTimeReferenceChange'
import { TicketTimeReference } from 'domains/reporting/models/stat/types'

describe('useNotifyOnTimeReferenceChange', () => {
    it('should notify when time reference changes to TaggedAt', async () => {
        const { rerender } = renderHook(
            ({ timeRef }) =>
                useNotifyOnTimeReferenceChange(ReportName.Tags, timeRef),
            {
                initialProps: { timeRef: TicketTimeReference.CreatedAt },
            },
        )

        rerender({ timeRef: TicketTimeReference.TaggedAt })

        const toastEl = await screen.findByRole('status', {
            name: createNotificationMessage(
                ReportName.Tags,
                TicketTimeReference.TaggedAt,
            ),
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
    })

    it('should notify when time reference changes to CreatedAt', async () => {
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

        const toastEl = await screen.findByRole('status', {
            name: createNotificationMessage(
                ReportName.TicketFields,
                TicketTimeReference.CreatedAt,
            ),
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
    })

    it('should not notify on initial mount', () => {
        renderHook(() =>
            useNotifyOnTimeReferenceChange(
                ReportName.TicketFields,
                TicketTimeReference.CreatedAt,
            ),
        )

        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
})
