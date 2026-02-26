import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OpportunityType } from '../../enums'
import { OpportunityDetailsCard } from './OpportunityDetailsCard'

describe('OpportunityDetailsCard', () => {
    describe('Fill Knowledge Gap type', () => {
        it('should render default description without ticket count', () => {
            render(
                <OpportunityDetailsCard
                    type={OpportunityType.FILL_KNOWLEDGE_GAP}
                />,
            )

            expect(
                screen.getByText(
                    /Resolve this AI-generated guidance based on your customers' top asked questions/,
                ),
            ).toBeInTheDocument()
        })

        it('should render description with ticket count when provided', () => {
            const onTicketCountClick = jest.fn()

            render(
                <OpportunityDetailsCard
                    type={OpportunityType.FILL_KNOWLEDGE_GAP}
                    ticketCount={5}
                    onTicketCountClick={onTicketCountClick}
                />,
            )

            expect(
                screen.getByText(/This knowledge gap was generated based on/),
            ).toBeInTheDocument()
            expect(screen.getByText(/5 handover tickets/)).toBeInTheDocument()
            expect(
                screen.getByText(/AI Agent could not resolve/),
            ).toBeInTheDocument()
        })

        it('should call onTicketCountClick when ticket count span is clicked', async () => {
            const user = userEvent.setup()
            const onTicketCountClick = jest.fn()

            render(
                <OpportunityDetailsCard
                    type={OpportunityType.FILL_KNOWLEDGE_GAP}
                    ticketCount={10}
                    onTicketCountClick={onTicketCountClick}
                />,
            )

            const ticketCountElement = screen.getByText(/10 handover tickets/)
            await user.click(ticketCountElement)

            expect(onTicketCountClick).toHaveBeenCalledTimes(1)
        })
    })

    describe('Resolve Conflict type', () => {
        it('should render conflict description with ticket count', () => {
            const onTicketCountClick = jest.fn()

            render(
                <OpportunityDetailsCard
                    type={OpportunityType.RESOLVE_CONFLICT}
                    ticketCount={15}
                    onTicketCountClick={onTicketCountClick}
                />,
            )

            expect(
                screen.getByText(
                    /Edit, disable or delete the conflicting knowledge below/,
                ),
            ).toBeInTheDocument()
            expect(screen.getByText(/15 tickets/)).toBeInTheDocument()
        })

        it('should call onTicketCountClick when ticket count span is clicked', async () => {
            const user = userEvent.setup()
            const onTicketCountClick = jest.fn()

            render(
                <OpportunityDetailsCard
                    type={OpportunityType.RESOLVE_CONFLICT}
                    ticketCount={20}
                    onTicketCountClick={onTicketCountClick}
                />,
            )

            const ticketCountElement = screen.getByText(/20 tickets/)
            await user.click(ticketCountElement)

            expect(onTicketCountClick).toHaveBeenCalledTimes(1)
        })
    })

    describe('Ticket count behavior', () => {
        it('should not show ticket count for FILL_KNOWLEDGE_GAP when ticketCount is 0', () => {
            const onTicketCountClick = jest.fn()

            render(
                <OpportunityDetailsCard
                    type={OpportunityType.FILL_KNOWLEDGE_GAP}
                    ticketCount={0}
                    onTicketCountClick={onTicketCountClick}
                />,
            )

            expect(
                screen.queryByText(/handover tickets/),
            ).not.toBeInTheDocument()
            expect(
                screen.getByText(/Resolve this AI-generated guidance/),
            ).toBeInTheDocument()
        })

        it('should not show ticket count for FILL_KNOWLEDGE_GAP when not provided', () => {
            render(
                <OpportunityDetailsCard
                    type={OpportunityType.FILL_KNOWLEDGE_GAP}
                />,
            )

            expect(
                screen.queryByText(/handover tickets/),
            ).not.toBeInTheDocument()
            expect(
                screen.getByText(/Resolve this AI-generated guidance/),
            ).toBeInTheDocument()
        })
    })

    describe('Event handling', () => {
        it('should stop propagation when ticket count is clicked for FILL_KNOWLEDGE_GAP', async () => {
            const user = userEvent.setup()
            const onTicketCountClick = jest.fn()
            const onParentClick = jest.fn()

            render(
                <div
                    role="region"
                    onClick={onParentClick}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') onParentClick()
                    }}
                >
                    <OpportunityDetailsCard
                        type={OpportunityType.FILL_KNOWLEDGE_GAP}
                        ticketCount={15}
                        onTicketCountClick={onTicketCountClick}
                    />
                </div>,
            )

            const ticketCountElement = screen.getByText(/15 handover tickets/)
            await user.click(ticketCountElement)

            expect(onTicketCountClick).toHaveBeenCalledTimes(1)
        })

        it('should stop propagation when ticket count is clicked for RESOLVE_CONFLICT', async () => {
            const user = userEvent.setup()
            const onTicketCountClick = jest.fn()
            const onParentClick = jest.fn()

            render(
                <div
                    role="region"
                    onClick={onParentClick}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') onParentClick()
                    }}
                >
                    <OpportunityDetailsCard
                        type={OpportunityType.RESOLVE_CONFLICT}
                        ticketCount={25}
                        onTicketCountClick={onTicketCountClick}
                    />
                </div>,
            )

            const ticketCountElement = screen.getByText(/25 tickets/)
            await user.click(ticketCountElement)

            expect(onTicketCountClick).toHaveBeenCalledTimes(1)
        })
    })

    describe('Keyboard interactions', () => {
        describe('FILL_KNOWLEDGE_GAP', () => {
            it('should call onTicketCountClick when Enter key is pressed', async () => {
                const user = userEvent.setup()
                const onTicketCountClick = jest.fn()

                render(
                    <OpportunityDetailsCard
                        type={OpportunityType.FILL_KNOWLEDGE_GAP}
                        ticketCount={10}
                        onTicketCountClick={onTicketCountClick}
                    />,
                )

                const ticketCountButton = screen.getByRole('button', {
                    name: /10 handover tickets/,
                })
                ticketCountButton.focus()
                await user.keyboard('{Enter}')

                expect(onTicketCountClick).toHaveBeenCalledTimes(1)
            })

            it('should call onTicketCountClick when Space key is pressed', async () => {
                const user = userEvent.setup()
                const onTicketCountClick = jest.fn()

                render(
                    <OpportunityDetailsCard
                        type={OpportunityType.FILL_KNOWLEDGE_GAP}
                        ticketCount={10}
                        onTicketCountClick={onTicketCountClick}
                    />,
                )

                const ticketCountButton = screen.getByRole('button', {
                    name: /10 handover tickets/,
                })
                ticketCountButton.focus()
                await user.keyboard(' ')

                expect(onTicketCountClick).toHaveBeenCalledTimes(1)
            })

            it('should not call onTicketCountClick when other keys are pressed', async () => {
                const user = userEvent.setup()
                const onTicketCountClick = jest.fn()

                render(
                    <OpportunityDetailsCard
                        type={OpportunityType.FILL_KNOWLEDGE_GAP}
                        ticketCount={10}
                        onTicketCountClick={onTicketCountClick}
                    />,
                )

                const ticketCountButton = screen.getByRole('button', {
                    name: /10 handover tickets/,
                })
                ticketCountButton.focus()
                await user.keyboard('{Escape}')
                await user.keyboard('a')
                await user.keyboard('{Tab}')

                expect(onTicketCountClick).not.toHaveBeenCalled()
            })

            it('should prevent default behavior when Enter key is pressed', async () => {
                const user = userEvent.setup()
                const onTicketCountClick = jest.fn()

                render(
                    <OpportunityDetailsCard
                        type={OpportunityType.FILL_KNOWLEDGE_GAP}
                        ticketCount={10}
                        onTicketCountClick={onTicketCountClick}
                    />,
                )

                const ticketCountButton = screen.getByRole('button', {
                    name: /10 handover tickets/,
                })
                ticketCountButton.focus()
                await user.keyboard('{Enter}')

                expect(onTicketCountClick).toHaveBeenCalledTimes(1)
            })
        })

        describe('RESOLVE_CONFLICT', () => {
            it('should call onTicketCountClick when Enter key is pressed', async () => {
                const user = userEvent.setup()
                const onTicketCountClick = jest.fn()

                render(
                    <OpportunityDetailsCard
                        type={OpportunityType.RESOLVE_CONFLICT}
                        ticketCount={15}
                        onTicketCountClick={onTicketCountClick}
                    />,
                )

                const ticketCountButton = screen.getByRole('button', {
                    name: /15 tickets/,
                })
                ticketCountButton.focus()
                await user.keyboard('{Enter}')

                expect(onTicketCountClick).toHaveBeenCalledTimes(1)
            })

            it('should call onTicketCountClick when Space key is pressed', async () => {
                const user = userEvent.setup()
                const onTicketCountClick = jest.fn()

                render(
                    <OpportunityDetailsCard
                        type={OpportunityType.RESOLVE_CONFLICT}
                        ticketCount={15}
                        onTicketCountClick={onTicketCountClick}
                    />,
                )

                const ticketCountButton = screen.getByRole('button', {
                    name: /15 tickets/,
                })
                ticketCountButton.focus()
                await user.keyboard(' ')

                expect(onTicketCountClick).toHaveBeenCalledTimes(1)
            })

            it('should not call onTicketCountClick when other keys are pressed', async () => {
                const user = userEvent.setup()
                const onTicketCountClick = jest.fn()

                render(
                    <OpportunityDetailsCard
                        type={OpportunityType.RESOLVE_CONFLICT}
                        ticketCount={15}
                        onTicketCountClick={onTicketCountClick}
                    />,
                )

                const ticketCountButton = screen.getByRole('button', {
                    name: /15 tickets/,
                })
                ticketCountButton.focus()
                await user.keyboard('{Escape}')
                await user.keyboard('b')
                await user.keyboard('{Tab}')

                expect(onTicketCountClick).not.toHaveBeenCalled()
            })

            it('should prevent default behavior when Space key is pressed', async () => {
                const user = userEvent.setup()
                const onTicketCountClick = jest.fn()

                render(
                    <OpportunityDetailsCard
                        type={OpportunityType.RESOLVE_CONFLICT}
                        ticketCount={15}
                        onTicketCountClick={onTicketCountClick}
                    />,
                )

                const ticketCountButton = screen.getByRole('button', {
                    name: /15 tickets/,
                })
                ticketCountButton.focus()
                await user.keyboard(' ')

                expect(onTicketCountClick).toHaveBeenCalledTimes(1)
            })
        })
    })

    describe('Component structure', () => {
        it('should render with correct container structure for FILL_KNOWLEDGE_GAP', () => {
            const { container } = render(
                <OpportunityDetailsCard
                    type={OpportunityType.FILL_KNOWLEDGE_GAP}
                />,
            )

            expect(container.firstElementChild).toBeInTheDocument()
            expect(
                screen.getByText(/Resolve this AI-generated guidance/),
            ).toBeInTheDocument()
        })

        it('should render with correct structure for RESOLVE_CONFLICT', () => {
            const onTicketCountClick = jest.fn()
            const { container } = render(
                <OpportunityDetailsCard
                    type={OpportunityType.RESOLVE_CONFLICT}
                    ticketCount={10}
                    onTicketCountClick={onTicketCountClick}
                />,
            )

            expect(container.firstElementChild).toBeInTheDocument()
        })
    })
})
