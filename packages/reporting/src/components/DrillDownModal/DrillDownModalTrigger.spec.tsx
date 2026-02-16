import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { DrillDownModalTrigger } from './DrillDownModalTrigger'

describe('DrillDownModalTrigger', () => {
    const tooltipText = 'Click to view details'
    const openDrillDownModal = vi.fn()
    const childrenText = 'Trigger content'

    beforeEach(() => {
        vi.clearAllMocks()
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should render children when enabled', () => {
        render(
            <DrillDownModalTrigger
                tooltipText={tooltipText}
                openDrillDownModal={openDrillDownModal}
            >
                {childrenText}
            </DrillDownModalTrigger>,
        )

        expect(screen.getByText(childrenText)).toBeInTheDocument()
    })

    it('should call openDrillDownModal when clicked', async () => {
        const user = userEvent.setup({ delay: null })

        render(
            <DrillDownModalTrigger
                tooltipText={tooltipText}
                openDrillDownModal={openDrillDownModal}
            >
                {childrenText}
            </DrillDownModalTrigger>,
        )

        await user.click(screen.getByText(childrenText))

        await act(async () => {
            await vi.runAllTimersAsync()
        })

        expect(openDrillDownModal).toHaveBeenCalledTimes(1)
    })

    it('should display tooltip on hover', async () => {
        const user = userEvent.setup({ delay: null })

        render(
            <DrillDownModalTrigger
                tooltipText={tooltipText}
                openDrillDownModal={openDrillDownModal}
            >
                {childrenText}
            </DrillDownModalTrigger>,
        )

        await user.hover(screen.getByText(childrenText))

        await act(async () => {
            await vi.runAllTimersAsync()
        })

        expect(screen.getByText(tooltipText)).toBeInTheDocument()
    })

    it('should render as empty body when disabled', () => {
        render(
            <DrillDownModalTrigger
                tooltipText={tooltipText}
                openDrillDownModal={openDrillDownModal}
                enabled={false}
            >
                {childrenText}
            </DrillDownModalTrigger>,
        )

        const container = screen.getByText(childrenText).parentElement

        expect(container?.tagName).toBe('BODY')
        expect(container).not.toHaveAttribute('id')
    })

    it('should not call openDrillDownModal when disabled and clicked', async () => {
        const user = userEvent.setup({ delay: null })

        render(
            <DrillDownModalTrigger
                tooltipText={tooltipText}
                openDrillDownModal={openDrillDownModal}
                enabled={false}
            >
                {childrenText}
            </DrillDownModalTrigger>,
        )

        await user.click(screen.getByText(childrenText))

        expect(openDrillDownModal).not.toHaveBeenCalled()
    })

    it('should not display tooltip when disabled', async () => {
        const user = userEvent.setup({ delay: null })

        render(
            <DrillDownModalTrigger
                tooltipText={tooltipText}
                openDrillDownModal={openDrillDownModal}
                enabled={false}
            >
                {childrenText}
            </DrillDownModalTrigger>,
        )

        await user.hover(screen.getByText(childrenText))

        await act(async () => {
            await vi.runAllTimersAsync()
        })

        expect(screen.queryByText(tooltipText)).not.toBeInTheDocument()
    })

    it('should render children when disabled', () => {
        render(
            <DrillDownModalTrigger
                tooltipText={tooltipText}
                openDrillDownModal={openDrillDownModal}
                enabled={false}
            >
                {childrenText}
            </DrillDownModalTrigger>,
        )

        expect(screen.getByText(childrenText)).toBeInTheDocument()
    })
})
