import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'

import { useTicketThreadDateTimeFormat } from '../../../../hooks/shared/useTicketThreadDateTimeFormat'
import { MessageTimestamp } from '../MessageHeader/MessageTimestamp'

vi.mock('@gorgias/axiom', async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>

    return {
        ...actual,
        Tooltip: ({
            trigger,
            children,
        }: {
            trigger: ReactNode
            children: ReactNode
        }) => (
            <>
                {trigger}
                {children}
            </>
        ),
        TooltipContent: ({
            title,
            children,
        }: {
            title?: string
            children?: ReactNode
        }) => <>{title ?? children}</>,
    }
})

vi.mock('../../../../hooks/shared/useTicketThreadDateTimeFormat', () => ({
    useTicketThreadDateTimeFormat: vi.fn(),
}))

describe('MessageTimestamp', () => {
    beforeEach(() => {
        vi.mocked(useTicketThreadDateTimeFormat).mockReturnValue({
            format: {
                relative: 'YYYY-MM-DD',
                compact: 'YYYY-MM-DD HH:mm',
            },
            timezone: 'America/Los_Angeles',
        })
    })

    it('renders the compact datetime in the tooltip content', () => {
        render(<MessageTimestamp createdDatetime="2024-03-21T00:00:00Z" />)

        expect(screen.getByText('2024-03-20')).toBeInTheDocument()
        expect(screen.getByText('Date:')).toBeInTheDocument()
        expect(screen.getByText('2024-03-20 17:00')).toBeInTheDocument()
    })
})
