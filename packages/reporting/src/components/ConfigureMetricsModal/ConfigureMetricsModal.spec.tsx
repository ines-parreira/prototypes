import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'

import { ConfigureMetricsModal } from './ConfigureMetricsModal'
import type { MetricConfigItem } from './types'

vi.mock('react-dnd', () => ({
    DndProvider: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
    useDrag: () => [{ isDragging: false }, vi.fn(), vi.fn()],
    useDrop: () => [{ isOver: false }, vi.fn()],
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

    beforeEach(() => {
        vi.clearAllMocks()
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
        renderComponent()

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
})
