import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { KnowledgeResource } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import KnowledgeSourcePopover from '../KnowledgeSourcePopover'

jest.mock('utils', () => ({
    stripHTML: (html: string) => html,
}))

const resource: KnowledgeResource = {
    executionId: '5d0d58b3-5522-41b8-8edc-5ea9382cb5a7',
    resource: {
        id: '587547',
        resourceId: '5994752147558',
        resourceType: 'ORDER',
        resourceSetId: '5994752147558',
        resourceLocale: null,
        resourceTitle: '#3584',
        feedback: null,
    },
    metadata: {
        title: 'Order #3584',
        content: 'Order #3584',
        url: 'https://admin.shopify.com/store/artemisathletix/orders/5994752147558',
    },
}

describe('KnowledgeSourcePopover', () => {
    it('should show popover content on hover and hides on mouse leave', async () => {
        render(
            <KnowledgeSourcePopover resource={resource}>
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

        expect(
            screen.queryByText(resource.metadata.title),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText(resource.metadata.content),
        ).not.toBeInTheDocument()

        const trigger = screen.getByText('Hover me')

        fireEvent.mouseOver(trigger)

        await waitFor(() =>
            expect(
                screen.getByText(resource.metadata.title),
            ).toBeInTheDocument(),
        )

        expect(screen.getByText(resource.metadata.content)).toBeInTheDocument()

        fireEvent.mouseOut(trigger)

        await waitFor(() =>
            expect(
                screen.queryByText(resource.metadata.title),
            ).not.toBeInTheDocument(),
        )
    })

    it('should have correct href and target attributes for popover link', async () => {
        render(
            <KnowledgeSourcePopover resource={resource}>
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
            expect(
                screen.getByText(resource.metadata.title),
            ).toBeInTheDocument(),
        )

        const link = screen.getByRole('link', { name: /Order #3584/i })

        expect(link).toHaveAttribute('href', resource.metadata.url)
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noreferrer noopener')
    })
})
