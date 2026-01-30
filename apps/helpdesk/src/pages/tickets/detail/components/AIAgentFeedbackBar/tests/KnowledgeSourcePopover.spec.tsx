import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import KnowledgeSourcePopover from '../KnowledgeSourcePopover'

jest.mock('utils', () => ({
    ...jest.requireActual('utils'),
    stripHTML: (html: string) => html,
}))

jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
)
const useGetGuidancesAvailableActionsMocked = assumeMock(
    useGetGuidancesAvailableActions,
)

const popoverProps = {
    url: 'https://admin.shopify.com/store/artemisathletix/orders/5994752147558',
    title: 'Order #3584',
    content: 'Order #3584',
    knowledgeResourceType: AiAgentKnowledgeResourceTypeEnum.ORDER,
    id: 'order-3584',
    shopName: 'test-shop',
    shopType: 'test-type',
}

describe('KnowledgeSourcePopover', () => {
    beforeEach(() => {
        useGetGuidancesAvailableActionsMocked.mockReturnValue({
            isLoading: false,
            guidanceActions: [],
        })
    })
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

    it('should show Draft tag when isDraft is true', async () => {
        render(
            <KnowledgeSourcePopover {...popoverProps} isDraft>
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

        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('should not show Draft tag when isDraft is false', async () => {
        render(
            <KnowledgeSourcePopover {...popoverProps} isDraft={false}>
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

        expect(screen.queryByText('Draft')).not.toBeInTheDocument()
    })
})
