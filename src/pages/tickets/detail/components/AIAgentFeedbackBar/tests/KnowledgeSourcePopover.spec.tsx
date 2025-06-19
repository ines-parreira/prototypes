import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import KnowledgeSourcePopover from '../KnowledgeSourcePopover'

jest.mock('utils', () => ({
    stripHTML: (html: string) => html,
}))

const popoverProps = {
    url: 'https://admin.shopify.com/store/artemisathletix/orders/5994752147558',
    title: 'Order #3584',
    content: 'Order #3584',
    type: AiAgentKnowledgeResourceTypeEnum.ORDER,
    id: 'order-3584',
}

describe('KnowledgeSourcePopover', () => {
    it('should show popover content on hover and hides on mouse leave', async () => {
        render(
            <KnowledgeSourcePopover {...popoverProps}>
                {(ref, eventHandlers) => (
                    <div
                        ref={ref as React.RefObject<HTMLDivElement>}
                        {...eventHandlers}
                    >
                        Hover me
                    </div>
                )}
            </KnowledgeSourcePopover>,
        )

        expect(screen.queryByText(popoverProps.title)).not.toBeInTheDocument()
        expect(screen.queryByText(popoverProps.content)).not.toBeInTheDocument()

        const trigger = screen.getByText('Hover me')

        fireEvent.mouseOver(trigger)

        await waitFor(() =>
            expect(screen.getByText(popoverProps.title)).toBeInTheDocument(),
        )

        expect(screen.getByText(popoverProps.content)).toBeInTheDocument()

        fireEvent.mouseOut(trigger)

        await waitFor(() =>
            expect(
                screen.queryByText(popoverProps.title),
            ).not.toBeInTheDocument(),
        )
    })

    it('should have correct href and target attributes for popover link', async () => {
        render(
            <KnowledgeSourcePopover {...popoverProps}>
                {(ref, eventHandlers) => (
                    <div
                        ref={ref as React.RefObject<HTMLDivElement>}
                        {...eventHandlers}
                    >
                        Hover me
                    </div>
                )}
            </KnowledgeSourcePopover>,
        )

        const trigger = screen.getByText('Hover me')
        fireEvent.mouseOver(trigger)

        await waitFor(() =>
            expect(screen.getByText(popoverProps.title)).toBeInTheDocument(),
        )

        const link = screen.getByRole('link', { name: /Order #3584/i })

        expect(link).toHaveAttribute('href', popoverProps.url)
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noreferrer noopener')
    })
})
