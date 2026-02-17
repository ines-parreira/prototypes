import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MetricsConfigurator } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/MetricsConfigurator'

jest.mock('@repo/reporting', () => ({
    ConfigureMetricsModal: jest.fn(() => null),
}))

describe('MetricsConfigurator', () => {
    const { ConfigureMetricsModal } = require('@repo/reporting')
    const mockMetrics = [
        { id: 'metric1', label: 'Metric 1', visibility: true },
        { id: 'metric2', label: 'Metric 2', visibility: true },
        { id: 'metric3', label: 'Metric 3', visibility: false },
    ]

    beforeEach(() => {
        ConfigureMetricsModal.mockClear()
    })

    it('should render edit metrics button', () => {
        render(<MetricsConfigurator metrics={mockMetrics} />)

        expect(
            screen.getByRole('button', { name: /edit metrics/i }),
        ).toBeInTheDocument()
    })

    it('should pass correct props to ConfigureMetricsModal when closed', () => {
        render(<MetricsConfigurator metrics={mockMetrics} />)

        expect(ConfigureMetricsModal).toHaveBeenCalledWith(
            expect.objectContaining({
                isOpen: false,
                metrics: mockMetrics,
                onClose: expect.any(Function),
                onSave: expect.any(Function),
            }),
            expect.anything(),
        )
    })

    it('should pass isOpen true to ConfigureMetricsModal when button is clicked', async () => {
        const user = userEvent.setup()
        render(<MetricsConfigurator metrics={mockMetrics} />)

        const editButton = screen.getByRole('button', { name: /edit metrics/i })
        await user.click(editButton)

        expect(ConfigureMetricsModal).toHaveBeenCalledWith(
            expect.objectContaining({
                isOpen: true,
                metrics: mockMetrics,
            }),
            expect.anything(),
        )
    })

    it('should toggle modal state from closed to open to closed', async () => {
        const user = userEvent.setup()
        render(<MetricsConfigurator metrics={mockMetrics} />)

        expect(ConfigureMetricsModal).toHaveBeenLastCalledWith(
            expect.objectContaining({ isOpen: false }),
            expect.anything(),
        )

        const editButton = screen.getByRole('button', { name: /edit metrics/i })
        await user.click(editButton)

        expect(ConfigureMetricsModal).toHaveBeenLastCalledWith(
            expect.objectContaining({ isOpen: true }),
            expect.anything(),
        )

        const lastCall =
            ConfigureMetricsModal.mock.calls[
                ConfigureMetricsModal.mock.calls.length - 1
            ]
        const onCloseCallback = lastCall[0].onClose

        act(() => {
            onCloseCallback()
        })

        expect(ConfigureMetricsModal).toHaveBeenLastCalledWith(
            expect.objectContaining({ isOpen: false }),
            expect.anything(),
        )
    })
})
