import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { TicketSubjectLoadingState } from '../TicketSubjectLoadingState'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)

describe('TicketSubjectLoadingState', () => {
    const mockChildren = <div>Ticket Subject Content</div>

    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
    })

    describe('when MessagesTranslations feature flag is disabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(false)
        })

        it('should render children regardless of loading state', () => {
            const { rerender } = render(
                <TicketSubjectLoadingState isInitialLoading={true}>
                    {mockChildren}
                </TicketSubjectLoadingState>,
            )

            expect(
                screen.getByText('Ticket Subject Content'),
            ).toBeInTheDocument()

            rerender(
                <TicketSubjectLoadingState isInitialLoading={false}>
                    {mockChildren}
                </TicketSubjectLoadingState>,
            )

            expect(
                screen.getByText('Ticket Subject Content'),
            ).toBeInTheDocument()
        })

        it('should not render loading skeleton', () => {
            render(
                <TicketSubjectLoadingState isInitialLoading={true}>
                    {mockChildren}
                </TicketSubjectLoadingState>,
            )

            expect(screen.queryByRole('status')).not.toBeInTheDocument()
            expect(
                screen.queryByLabelText('Loading ticket subject'),
            ).not.toBeInTheDocument()
        })
    })

    describe('when MessagesTranslations feature flag is enabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
        })

        describe('when isInitialLoading is true', () => {
            it('should render loading skeleton with proper accessibility attributes', () => {
                render(
                    <TicketSubjectLoadingState isInitialLoading={true}>
                        {mockChildren}
                    </TicketSubjectLoadingState>,
                )

                const skeleton = screen.getByRole('status')
                expect(skeleton).toBeInTheDocument()
                expect(skeleton).toHaveAttribute('aria-busy', 'true')
                expect(skeleton).toHaveAttribute('aria-live', 'polite')
                expect(skeleton).toHaveAttribute(
                    'aria-label',
                    'Loading ticket subject',
                )
            })

            it('should not render children when loading', () => {
                render(
                    <TicketSubjectLoadingState isInitialLoading={true}>
                        {mockChildren}
                    </TicketSubjectLoadingState>,
                )

                expect(
                    screen.queryByText('Ticket Subject Content'),
                ).not.toBeInTheDocument()
            })

            it('should render skeleton content element', () => {
                const { container } = render(
                    <TicketSubjectLoadingState isInitialLoading={true}>
                        {mockChildren}
                    </TicketSubjectLoadingState>,
                )

                const skeletonContent =
                    container.querySelector('.skeletonSubject')
                expect(skeletonContent).toBeInTheDocument()
            })
        })

        describe('when isInitialLoading is false', () => {
            it('should render children', () => {
                render(
                    <TicketSubjectLoadingState isInitialLoading={false}>
                        {mockChildren}
                    </TicketSubjectLoadingState>,
                )

                expect(
                    screen.getByText('Ticket Subject Content'),
                ).toBeInTheDocument()
            })

            it('should not render loading skeleton', () => {
                render(
                    <TicketSubjectLoadingState isInitialLoading={false}>
                        {mockChildren}
                    </TicketSubjectLoadingState>,
                )

                expect(screen.queryByRole('status')).not.toBeInTheDocument()
                expect(
                    screen.queryByLabelText('Loading ticket subject'),
                ).not.toBeInTheDocument()
            })
        })

        describe('loading state transitions', () => {
            it('should transition from loading to loaded state', () => {
                const { rerender } = render(
                    <TicketSubjectLoadingState isInitialLoading={true}>
                        {mockChildren}
                    </TicketSubjectLoadingState>,
                )

                expect(screen.getByRole('status')).toBeInTheDocument()
                expect(
                    screen.queryByText('Ticket Subject Content'),
                ).not.toBeInTheDocument()

                rerender(
                    <TicketSubjectLoadingState isInitialLoading={false}>
                        {mockChildren}
                    </TicketSubjectLoadingState>,
                )

                expect(screen.queryByRole('status')).not.toBeInTheDocument()
                expect(
                    screen.getByText('Ticket Subject Content'),
                ).toBeInTheDocument()
            })

            it('should transition from loaded to loading state', () => {
                const { rerender } = render(
                    <TicketSubjectLoadingState isInitialLoading={false}>
                        {mockChildren}
                    </TicketSubjectLoadingState>,
                )

                expect(screen.queryByRole('status')).not.toBeInTheDocument()
                expect(
                    screen.getByText('Ticket Subject Content'),
                ).toBeInTheDocument()

                rerender(
                    <TicketSubjectLoadingState isInitialLoading={true}>
                        {mockChildren}
                    </TicketSubjectLoadingState>,
                )

                expect(screen.getByRole('status')).toBeInTheDocument()
                expect(
                    screen.queryByText('Ticket Subject Content'),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('feature flag verification', () => {
        it('should call useFlag with correct feature flag key', () => {
            render(
                <TicketSubjectLoadingState isInitialLoading={false}>
                    {mockChildren}
                </TicketSubjectLoadingState>,
            )

            expect(useFlagMock).toHaveBeenCalledWith(
                FeatureFlagKey.MessagesTranslations,
            )
        })
    })

    describe('with different children types', () => {
        it('should handle complex children elements', () => {
            useFlagMock.mockReturnValue(true)

            const complexChildren = (
                <div>
                    <h1>Title</h1>
                    <p>Description</p>
                    <button>Action</button>
                </div>
            )

            render(
                <TicketSubjectLoadingState isInitialLoading={false}>
                    {complexChildren}
                </TicketSubjectLoadingState>,
            )

            expect(
                screen.getByRole('heading', { name: 'Title' }),
            ).toBeInTheDocument()
            expect(screen.getByText('Description')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Action' }),
            ).toBeInTheDocument()
        })

        it('should handle text node children', () => {
            useFlagMock.mockReturnValue(true)

            render(
                <TicketSubjectLoadingState isInitialLoading={false}>
                    Plain text content
                </TicketSubjectLoadingState>,
            )

            expect(screen.getByText('Plain text content')).toBeInTheDocument()
        })

        it('should handle null children', () => {
            useFlagMock.mockReturnValue(true)

            const { container } = render(
                <TicketSubjectLoadingState isInitialLoading={false}>
                    {null}
                </TicketSubjectLoadingState>,
            )

            expect(container.textContent).toBe('')
        })
    })
})
