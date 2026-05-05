import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useDrag, useDrop } from 'react-dnd'
import { vi } from 'vitest'

import { SidePanelSize } from '@gorgias/axiom'

import { ConfigureMetricsModal } from './ConfigureMetricsModal'
import type { MetricConfigItem } from './types'

vi.mock('react-dnd', () => ({
    DndProvider: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
    useDrag: vi.fn(),
    useDrop: vi.fn(),
}))

vi.mock('react-dnd-html5-backend', () => ({
    HTML5Backend: {},
}))

const mockMetrics: MetricConfigItem[] = [
    {
        id: 'metric-1',
        label: 'Overall automation rate',
        visibility: true,
        hint: 'Percentage of interactions handled automatically',
    },
    { id: 'metric-2', label: 'Automated interactions', visibility: true },
    {
        id: 'metric-3',
        label: 'Handover',
        visibility: false,
        hint: 'Number of conversations handed over to agents',
    },
    { id: 'metric-4', label: 'Drop-off', visibility: true },
    { id: 'metric-5', label: 'Response time', visibility: false },
    { id: 'metric-6', label: 'Customer satisfaction', visibility: false },
]

describe('ConfigureMetricsModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        metrics: mockMetrics,
        onSave: vi.fn(),
    }

    let capturedDropSpecs: Array<{
        hover: (item: { index: number }) => void
    }> = []

    beforeEach(() => {
        vi.clearAllMocks()
        capturedDropSpecs = []
        vi.mocked(useDrag).mockImplementation((spec: any) => [
            {
                isDragging: spec.collect({ isDragging: () => false })
                    .isDragging,
            },
            vi.fn(),
            vi.fn(),
        ])
        vi.mocked(useDrop).mockImplementation((spec: any) => {
            capturedDropSpecs.push(spec)
            return [{ isOver: false }, vi.fn()]
        })
    })

    const renderComponent = (props = {}) => {
        return render(<ConfigureMetricsModal {...defaultProps} {...props} />)
    }

    it('should render modal with title and description', () => {
        renderComponent()

        expect(screen.getByText('Edit metrics')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Choose the 4 metrics you want to display and rearrange them as needed.',
            ),
        ).toBeInTheDocument()
    })

    it('should render all metrics', () => {
        renderComponent({ size: SidePanelSize.Md })

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
        expect(screen.getByText('Handover')).toBeInTheDocument()
        expect(screen.getByText('Drop-off')).toBeInTheDocument()
    })

    it('should have save button disabled initially', () => {
        renderComponent()

        const saveButton = screen.getByRole('button', { name: /save/i })
        expect(saveButton).toBeDisabled()
    })

    it('should enable save button when visibility is toggled', async () => {
        renderComponent()

        const saveButton = screen.getByRole('button', { name: /save/i })
        expect(saveButton).toBeDisabled()

        const toggles = screen.getAllByRole('switch')
        await act(async () => {
            await userEvent.click(toggles[0])
        })

        expect(saveButton).not.toBeDisabled()
    })

    it('should toggle visibility when clicking toggle', async () => {
        const onSave = vi.fn()
        renderComponent({ onSave })

        const toggles = screen.getAllByRole('switch')

        await act(async () => {
            await userEvent.click(toggles[0])
        })

        const saveButton = screen.getByRole('button', { name: /save/i })
        await act(async () => {
            await userEvent.click(saveButton)
        })

        expect(onSave).toHaveBeenCalledWith([
            {
                id: 'metric-1',
                label: 'Overall automation rate',
                visibility: false,
                hint: 'Percentage of interactions handled automatically',
            },
            {
                id: 'metric-2',
                label: 'Automated interactions',
                visibility: true,
            },
            {
                id: 'metric-3',
                label: 'Handover',
                visibility: false,
                hint: 'Number of conversations handed over to agents',
            },
            { id: 'metric-4', label: 'Drop-off', visibility: true },
            { id: 'metric-5', label: 'Response time', visibility: false },
            {
                id: 'metric-6',
                label: 'Customer satisfaction',
                visibility: false,
            },
        ])
    })

    it('should call onClose when cancel button is clicked', async () => {
        const onClose = vi.fn()
        renderComponent({ onClose })

        const cancelButton = screen.getByRole('button', { name: /cancel/i })
        await act(async () => {
            await userEvent.click(cancelButton)
        })

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onSave and onClose when save button is clicked', async () => {
        const onSave = vi.fn()
        const onClose = vi.fn()
        renderComponent({ onSave, onClose })

        const toggles = screen.getAllByRole('switch')
        await act(async () => {
            await userEvent.click(toggles[0])
        })

        const saveButton = screen.getByRole('button', { name: /save/i })
        await act(async () => {
            await userEvent.click(saveButton)
        })

        expect(onSave).toHaveBeenCalled()
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onSave but not onClose when isLoading prop is provided', async () => {
        const onSave = vi.fn()
        const onClose = vi.fn()
        renderComponent({ onSave, onClose, isLoading: false })

        const toggles = screen.getAllByRole('switch')
        await act(async () => {
            await userEvent.click(toggles[0])
        })

        const saveButton = screen.getByRole('button', { name: /save/i })
        await act(async () => {
            await userEvent.click(saveButton)
        })

        expect(onSave).toHaveBeenCalled()
        expect(onClose).not.toHaveBeenCalled()
    })

    it('should disable save button when isLoading is true', async () => {
        renderComponent({ isLoading: true })

        const toggles = screen.getAllByRole('switch')
        await act(async () => {
            await userEvent.click(toggles[0])
        })

        const saveButton = screen.getByRole('button', { name: /save/i })
        expect(saveButton).toBeDisabled()
    })

    it('should reset changes when cancel is clicked', async () => {
        const onSave = vi.fn()
        renderComponent({ onSave })

        const toggles = screen.getAllByRole('switch')
        await act(async () => {
            await userEvent.click(toggles[0])
        })

        const cancelButton = screen.getByRole('button', { name: /cancel/i })
        await act(async () => {
            await userEvent.click(cancelButton)
        })

        expect(onSave).not.toHaveBeenCalled()
    })

    describe('hint tooltips', () => {
        it('should render info icon for metrics with hints', () => {
            renderComponent()

            const infoIcons = screen.getAllByLabelText('info')
            expect(infoIcons).toHaveLength(2)
        })

        it('should not render info icon for metrics without hints', () => {
            const metricsWithoutHints: MetricConfigItem[] = [
                { id: 'metric-1', label: 'Metric A', visibility: true },
                { id: 'metric-2', label: 'Metric B', visibility: false },
            ]
            renderComponent({ metrics: metricsWithoutHints })

            expect(screen.queryByLabelText('info')).not.toBeInTheDocument()
        })
    })

    describe('maxVisibleMetric', () => {
        it('should disable toggles when max visible metrics is reached', async () => {
            renderComponent()

            const toggles = screen.getAllByRole('switch')

            expect(toggles[2]).not.toBeDisabled()
            expect(toggles[4]).not.toBeDisabled()

            await act(async () => {
                await userEvent.click(toggles[2])
            })

            expect(toggles[2]).toBeChecked()
            expect(toggles[4]).toBeDisabled()
            expect(toggles[5]).toBeDisabled()
        })

        it('should enable toggles when a metric is toggled off', async () => {
            const customMetrics: MetricConfigItem[] = [
                {
                    id: 'metric-1',
                    label: 'Overall automation rate',
                    visibility: true,
                },
                {
                    id: 'metric-2',
                    label: 'Automated interactions',
                    visibility: true,
                },
                { id: 'metric-3', label: 'Handover', visibility: false },
                { id: 'metric-4', label: 'Drop-off', visibility: false },
            ]

            renderComponent({
                metrics: customMetrics,
                maxVisibleMetric: 2,
            })

            const toggles = screen.getAllByRole('switch')

            expect(toggles[2]).toBeDisabled()

            await act(async () => {
                await userEvent.click(toggles[0])
            })

            expect(toggles[0]).not.toBeChecked()
            expect(toggles[2]).not.toBeDisabled()
        })
    })

    describe('group exclusion', () => {
        const groupMetrics: MetricConfigItem[] = [
            {
                id: 'total-sales',
                label: 'Total sales',
                visibility: true,
                group: 'sales',
            },
            {
                id: 'total-sales-klaviyo',
                label: 'Total sales (klaviyo)',
                visibility: false,
                group: 'sales',
            },
            {
                id: 'total-sales-attentive',
                label: 'Total sales (attentive)',
                visibility: false,
                group: 'sales',
            },
            {
                id: 'unrelated',
                label: 'Conversion rate',
                visibility: false,
            },
        ]

        it('should disable other group members when one is active', () => {
            renderComponent({ metrics: groupMetrics, maxVisibleMetric: 4 })

            const toggles = screen.getAllByRole('switch')

            expect(toggles[1]).toBeDisabled()
            expect(toggles[2]).toBeDisabled()
            expect(toggles[3]).not.toBeDisabled()
        })

        it('should enable other group members when the active one is turned off', async () => {
            renderComponent({ metrics: groupMetrics, maxVisibleMetric: 4 })

            const toggles = screen.getAllByRole('switch')

            await userEvent.click(toggles[0])

            expect(toggles[1]).not.toBeDisabled()
            expect(toggles[2]).not.toBeDisabled()
        })

        it('should count two simultaneously visible group members as a single slot', () => {
            const metrics: MetricConfigItem[] = [
                {
                    id: 'total-sales',
                    label: 'Total sales',
                    visibility: true,
                    group: 'sales',
                },
                {
                    id: 'total-sales-alt',
                    label: 'Total sales alt',
                    visibility: true,
                    group: 'sales',
                },
                { id: 'other', label: 'Other', visibility: false },
            ]

            renderComponent({ metrics, maxVisibleMetric: 2 })

            const toggles = screen.getAllByRole('switch')

            // total-sales-alt is disabled because total-sales is visible in the same group
            expect(toggles[1]).toBeDisabled()
            // 'other' is NOT disabled: the group counts as 1 slot, not 2, so currentVisibleCount (1) < maxVisibleMetric (2)
            expect(toggles[2]).not.toBeDisabled()
        })

        it('should count grouped metrics as 1 slot regardless of how many are visible', async () => {
            const metricsAtCapacity: MetricConfigItem[] = [
                {
                    id: 'total-sales',
                    label: 'Total sales',
                    visibility: true,
                    group: 'sales',
                },
                {
                    id: 'total-sales-klaviyo',
                    label: 'Total sales (klaviyo)',
                    visibility: false,
                    group: 'sales',
                },
                { id: 'orders', label: 'Orders', visibility: true },
                {
                    id: 'conversion',
                    label: 'Conversion rate',
                    visibility: true,
                },
                { id: 'reply', label: 'Reply rate', visibility: false },
            ]

            renderComponent({
                metrics: metricsAtCapacity,
                maxVisibleMetric: 3,
            })

            const toggles = screen.getAllByRole('switch')

            expect(toggles[4]).toBeDisabled()
        })

        it('should allow toggling a group member on when no one in the group is active', async () => {
            const noGroupActiveMetrics: MetricConfigItem[] = [
                {
                    id: 'total-sales',
                    label: 'Total sales',
                    visibility: false,
                    group: 'sales',
                },
                {
                    id: 'total-sales-klaviyo',
                    label: 'Total sales (klaviyo)',
                    visibility: false,
                    group: 'sales',
                },
                {
                    id: 'unrelated',
                    label: 'Conversion rate',
                    visibility: false,
                },
            ]

            renderComponent({
                metrics: noGroupActiveMetrics,
                maxVisibleMetric: 4,
            })

            const toggles = screen.getAllByRole('switch')

            expect(toggles[0]).not.toBeDisabled()
            expect(toggles[1]).not.toBeDisabled()

            await userEvent.click(toggles[0])

            expect(toggles[0]).toBeChecked()
            expect(toggles[1]).toBeDisabled()
        })
    })

    describe('chat container visibility', () => {
        let chatContainer: HTMLElement

        beforeEach(() => {
            chatContainer = document.createElement('div')
            chatContainer.id = 'gorgias-chat-container'
            chatContainer.style.display = ''
            document.body.appendChild(chatContainer)
        })

        afterEach(() => {
            const existingContainer = document.getElementById(
                'gorgias-chat-container',
            )
            if (existingContainer) {
                document.body.removeChild(existingContainer)
            }
        })

        it('should hide chat container when modal is open', () => {
            renderComponent({ isOpen: true })

            expect(chatContainer.style.display).toBe('none')
        })

        it('should show chat container when modal is closed', () => {
            renderComponent({ isOpen: false })

            expect(chatContainer.style.display).toBe('')
        })

        it('should toggle chat container visibility when isOpen changes', () => {
            const { rerender } = renderComponent({ isOpen: true })
            expect(chatContainer.style.display).toBe('none')

            rerender(<ConfigureMetricsModal {...defaultProps} isOpen={false} />)
            expect(chatContainer.style.display).toBe('')

            rerender(<ConfigureMetricsModal {...defaultProps} isOpen={true} />)
            expect(chatContainer.style.display).toBe('none')
        })

        it('should restore chat container display on unmount', () => {
            chatContainer.style.display = 'none'

            const { unmount } = renderComponent({ isOpen: true })
            expect(chatContainer.style.display).toBe('none')

            unmount()
            expect(chatContainer.style.display).toBe('')
        })

        it('should handle missing chat container gracefully', () => {
            document.body.removeChild(chatContainer)

            expect(() => renderComponent({ isOpen: true })).not.toThrow()
        })

        it('should handle cleanup when chat container does not exist', () => {
            const { unmount } = renderComponent({ isOpen: true })
            document.body.removeChild(chatContainer)

            expect(() => unmount()).not.toThrow()
        })
    })

    describe('drag and drop reordering', () => {
        it('should reorder metrics when dragged to a different position', async () => {
            const onSave = vi.fn()
            renderComponent({ onSave })

            act(() => {
                capturedDropSpecs[1].hover({ index: 0 })
            })

            const saveButton = screen.getByRole('button', { name: /save/i })
            expect(saveButton).not.toBeDisabled()

            await act(async () => {
                await userEvent.click(saveButton)
            })

            const savedMetrics = onSave.mock.calls[0][0]
            expect(savedMetrics[0].id).toBe('metric-2')
            expect(savedMetrics[1].id).toBe('metric-1')
        })

        it('should not reorder when dragged to the same position', () => {
            renderComponent()

            act(() => {
                capturedDropSpecs[0].hover({ index: 0 })
            })

            expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
        })
    })
})
