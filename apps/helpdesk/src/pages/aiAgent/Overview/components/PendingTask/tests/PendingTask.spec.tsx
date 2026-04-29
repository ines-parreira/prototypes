import { logEvent, SegmentEvent } from '@repo/logging'
import { render, userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'

import { PendingTask } from '../PendingTask'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        AiAgentOverviewPendingTaskClicked:
            'ai-agent-overview-pending-task-clicked',
    },
}))

describe('PendingTask', () => {
    it.each(['BASIC' as const, 'RECOMMENDED' as const])(
        'renders title, caption and type with value %s',
        (type) => {
            render(
                <PendingTask
                    caption="caption_text"
                    ctaUrl="/"
                    title="title_text"
                    type={type}
                />,
            )

            const titleElement = screen.getByText('title_text')
            expect(titleElement).toBeInTheDocument()
            const captionElement = screen.getByText('caption_text')
            expect(captionElement).toBeInTheDocument()
            const typeElement = screen.getByText(type)
            expect(typeElement).toBeInTheDocument()
        },
    )
    it('render the loading state', () => {
        const { container } = render(<PendingTask isLoading={true} />)

        expect(
            container.querySelector('[aria-busy="true"]'),
        ).toBeInTheDocument()
    })

    it.each(['BASIC' as const, 'RECOMMENDED' as const])(
        'calls segment log with type %s on click',
        (type) => {
            render(
                <PendingTask
                    caption="caption_text"
                    ctaUrl="/"
                    title="title_text"
                    type={type}
                />,
            )

            userEvent.click(screen.getByRole('link'))

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentOverviewPendingTaskClicked,
                {
                    title: 'title_text',
                    task_type: type,
                },
            )
        },
    )
})
