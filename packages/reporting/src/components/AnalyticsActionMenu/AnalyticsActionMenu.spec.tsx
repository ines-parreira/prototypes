import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@gorgias/axiom', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...(actual as object),
        Tooltip: ({
            trigger,
            children,
        }: {
            trigger: unknown
            children: unknown
        }) => (
            <>
                {trigger as React.ReactNode}
                {children as React.ReactNode}
            </>
        ),
        TooltipContent: ({ title }: { title: string }) => (
            <div role="tooltip">{title}</div>
        ),
    }
})

import { AnalyticsActionMenu } from './AnalyticsActionMenu'
import type { AnalyticsActionItem } from './AnalyticsActionMenu'

const noop = () => {}

const downloadAction: AnalyticsActionItem = {
    icon: 'download',
    label: 'Export as CSV',
    onClick: noop,
}

const addAction: AnalyticsActionItem = {
    icon: 'add-plus',
    label: 'Add To Dashboard',
    onClick: noop,
}

const deleteAction: AnalyticsActionItem = {
    icon: 'trash-empty',
    label: 'Remove from dashboard',
    onClick: noop,
}

describe('AnalyticsActionMenu', () => {
    describe('when actions is empty', () => {
        it('renders nothing', () => {
            const { container } = render(<AnalyticsActionMenu actions={[]} />)
            expect(container).toBeEmptyDOMElement()
        })
    })

    describe('single action', () => {
        it('renders a standalone button with the action label', () => {
            render(<AnalyticsActionMenu actions={[downloadAction]} />)

            expect(
                screen.getByRole('button', { name: 'Export as CSV' }),
            ).toBeInTheDocument()
        })

        it('calls onClick when clicked', async () => {
            const onClick = vi.fn()
            const { user } = render(
                <AnalyticsActionMenu
                    actions={[{ ...downloadAction, onClick }]}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Export as CSV' }),
            )

            expect(onClick).toHaveBeenCalledOnce()
        })

        it('is disabled when isDisabled is true', () => {
            render(
                <AnalyticsActionMenu
                    actions={[{ ...downloadAction, isDisabled: true }]}
                />,
            )

            expect(
                screen.getByRole('button', { name: 'Export as CSV' }),
            ).toBeDisabled()
        })

        describe('with tooltip', () => {
            it('renders tooltip content when tooltip is provided', () => {
                render(
                    <AnalyticsActionMenu
                        actions={[
                            { ...downloadAction, tooltip: 'Export data' },
                        ]}
                    />,
                )

                expect(screen.getByRole('tooltip')).toHaveTextContent(
                    'Export data',
                )
            })

            it('does not render a tooltip when tooltip is not provided', () => {
                render(<AnalyticsActionMenu actions={[downloadAction]} />)

                expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
            })
        })

        describe('with dropdownContent', () => {
            it('renders the action button', () => {
                render(
                    <AnalyticsActionMenu
                        actions={[
                            {
                                ...downloadAction,
                                dropdownContent: () => (
                                    <div>Dropdown content</div>
                                ),
                            },
                        ]}
                    />,
                )

                expect(
                    screen.getByRole('button', { name: 'Export as CSV' }),
                ).toBeInTheDocument()
            })

            it('opens dropdown content when button is clicked', async () => {
                const { user } = render(
                    <AnalyticsActionMenu
                        actions={[
                            {
                                ...downloadAction,
                                dropdownContent: () => (
                                    <div>Dropdown content</div>
                                ),
                            },
                        ]}
                    />,
                )

                await user.click(
                    screen.getByRole('button', { name: 'Export as CSV' }),
                )

                expect(
                    await screen.findByText('Dropdown content'),
                ).toBeInTheDocument()
            })

            it('closes dropdown when close callback is called', async () => {
                const { user } = render(
                    <AnalyticsActionMenu
                        actions={[
                            {
                                ...downloadAction,
                                dropdownContent: (close) => (
                                    <button onClick={close}>Close me</button>
                                ),
                            },
                        ]}
                    />,
                )

                await user.click(
                    screen.getByRole('button', { name: 'Export as CSV' }),
                )
                await user.click(
                    await screen.findByRole('button', { name: 'Close me' }),
                )

                expect(
                    screen.queryByRole('button', { name: 'Close me' }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('multiple actions', () => {
        it('renders a "Chart actions" trigger button', () => {
            render(
                <AnalyticsActionMenu
                    actions={[downloadAction, addAction, deleteAction]}
                />,
            )

            expect(
                screen.getByRole('button', { name: 'Chart actions' }),
            ).toBeInTheDocument()
        })

        it('opens a menu with action items when trigger is clicked', async () => {
            const { user } = render(
                <AnalyticsActionMenu actions={[downloadAction, addAction]} />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Chart actions' }),
            )

            expect(
                await screen.findByRole('menuitem', {
                    name: /Export as CSV/,
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /Add To Dashboard/ }),
            ).toBeInTheDocument()
        })

        it('calls the action onClick when a menu item is clicked', async () => {
            const onClick = vi.fn()
            const { user } = render(
                <AnalyticsActionMenu
                    actions={[{ ...downloadAction, onClick }, addAction]}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Chart actions' }),
            )
            await user.click(
                await screen.findByRole('menuitem', {
                    name: /Export as CSV/,
                }),
            )

            expect(onClick).toHaveBeenCalledOnce()
        })

        it('disables a menu item when isDisabled is true', async () => {
            const { user } = render(
                <AnalyticsActionMenu
                    actions={[
                        { ...downloadAction, isDisabled: true },
                        addAction,
                    ]}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: 'Chart actions' }),
            )

            expect(
                await screen.findByRole('menuitem', {
                    name: /Export as CSV/,
                }),
            ).toHaveAttribute('aria-disabled', 'true')
        })

        describe('with dropdownContent on a menu item', () => {
            it('opens dropdown content when the menu item is clicked', async () => {
                const { user } = render(
                    <AnalyticsActionMenu
                        actions={[
                            {
                                ...downloadAction,
                                dropdownContent: () => (
                                    <div>Dropdown content</div>
                                ),
                            },
                            addAction,
                        ]}
                    />,
                )

                await user.click(
                    screen.getByRole('button', { name: 'Chart actions' }),
                )
                await user.click(
                    await screen.findByRole('menuitem', {
                        name: /Export as CSV/,
                    }),
                )

                expect(
                    await screen.findByText('Dropdown content'),
                ).toBeInTheDocument()
            })

            it('closes dropdown when close callback is called', async () => {
                const { user } = render(
                    <AnalyticsActionMenu
                        actions={[
                            {
                                ...downloadAction,
                                dropdownContent: (close) => (
                                    <button onClick={close}>Close me</button>
                                ),
                            },
                            addAction,
                        ]}
                    />,
                )

                await user.click(
                    screen.getByRole('button', { name: 'Chart actions' }),
                )
                await user.click(
                    await screen.findByRole('menuitem', {
                        name: /Export as CSV/,
                    }),
                )
                await user.click(
                    await screen.findByRole('button', { name: 'Close me' }),
                )

                expect(
                    screen.queryByRole('button', { name: 'Close me' }),
                ).not.toBeInTheDocument()
            })
        })
    })
})
