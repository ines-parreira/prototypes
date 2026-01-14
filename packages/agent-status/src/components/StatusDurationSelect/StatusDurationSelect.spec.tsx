import { act, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DURATION_OPTIONS } from '../../constants'
import { render } from '../../tests/render.utils'
import { StatusDurationSelect } from './StatusDurationSelect'

function getDurationSelect() {
    const container = screen.getByTestId('hidden-select-container')
    return container.querySelector('select')!
}

describe('StatusDurationSelect', () => {
    const defaultProps = {
        value: DURATION_OPTIONS[0],
        onChange: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render with label and selected value', () => {
        render(<StatusDurationSelect {...defaultProps} />)

        expect(screen.getByText('Status duration')).toBeInTheDocument()
        expect(screen.getAllByText('Unlimited').length).toBeGreaterThan(0)
    })

    it('should call onChange with selected option', async () => {
        const onChange = vi.fn()
        const { user } = render(
            <StatusDurationSelect {...defaultProps} onChange={onChange} />,
        )

        const select = getDurationSelect()
        await act(() => user.selectOptions(select, '30-minutes'))

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                name: '30 minutes',
                id: '30-minutes',
                unit: 'minutes',
                value: 30,
            }),
        )
    })

    it('should handle null value for unlimited duration', async () => {
        const onChange = vi.fn()
        const { user } = render(
            <StatusDurationSelect
                value={DURATION_OPTIONS[1]}
                onChange={onChange}
            />,
        )

        const select = getDurationSelect()
        await act(() => user.selectOptions(select, 'unlimited'))

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Unlimited',
                id: 'unlimited',
                value: null,
            }),
        )
    })

    it('should display error message when provided', () => {
        render(
            <StatusDurationSelect
                {...defaultProps}
                error="Duration is required"
            />,
        )

        expect(screen.getByText('Duration is required')).toBeInTheDocument()
    })
})
