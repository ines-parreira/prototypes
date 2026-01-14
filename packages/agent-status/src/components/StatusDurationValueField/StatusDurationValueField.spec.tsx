import { act, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render } from '../../tests/render.utils'
import { StatusDurationValueField } from './StatusDurationValueField'

describe('StatusDurationValueField', () => {
    const defaultProps = {
        value: 1,
        onChange: vi.fn(),
        minValue: 1,
        maxValue: 1440,
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render with numeric input mode', () => {
        render(<StatusDurationValueField {...defaultProps} />)

        const input = screen.getByDisplayValue('1')
        expect(input).toBeInTheDocument()
        expect(input).toHaveAttribute('inputmode', 'numeric')
    })

    it('should call onChange when typing number', async () => {
        const onChange = vi.fn()
        const { user } = render(
            <StatusDurationValueField
                {...defaultProps}
                value={0}
                onChange={onChange}
            />,
        )

        const input = screen.getByDisplayValue('0')
        await act(() => user.type(input, '5'))

        expect(onChange).toHaveBeenCalledWith(5)
    })

    it('should call onChange with 0 when cleared', async () => {
        const onChange = vi.fn()
        const { user } = render(
            <StatusDurationValueField
                {...defaultProps}
                value={15}
                onChange={onChange}
            />,
        )

        const input = screen.getByDisplayValue('15')
        await act(() => user.clear(input))

        expect(onChange).toHaveBeenCalledWith(0)
    })

    it('should extract numbers from alphanumeric input', async () => {
        const onChange = vi.fn()
        const { user } = render(
            <StatusDurationValueField {...defaultProps} onChange={onChange} />,
        )

        const input = screen.getByDisplayValue('1')
        await act(async () => {
            await user.clear(input)
            await user.type(input, '12abc')
        })

        expect(onChange).toHaveBeenCalledWith(12)
    })

    it('should display error message when provided', () => {
        render(
            <StatusDurationValueField
                {...defaultProps}
                error="Value must be between 1 and 1440"
            />,
        )

        expect(
            screen.getByText('Value must be between 1 and 1440'),
        ).toBeInTheDocument()
    })
})
