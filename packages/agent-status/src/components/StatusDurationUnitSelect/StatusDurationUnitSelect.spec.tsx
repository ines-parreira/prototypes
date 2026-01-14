import { act, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { DurationUnit } from '@gorgias/helpdesk-queries'

import { render } from '../../tests/render.utils'
import { StatusDurationUnitSelect } from './StatusDurationUnitSelect'

describe('StatusDurationUnitSelect', () => {
    const defaultProps = {
        value: 'minutes' as DurationUnit,
        onChange: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it.each<[DurationUnit, string]>([
        ['minutes', 'Minutes'],
        ['hours', 'Hours'],
        ['days', 'Days'],
    ])('should render with %s selected', (value, displayText) => {
        render(<StatusDurationUnitSelect {...defaultProps} value={value} />)

        const inputs = screen.queryAllByDisplayValue(displayText)
        expect(inputs.length).toBeGreaterThan(0)
    })

    it('should call onChange when selecting different unit', async () => {
        const onChange = vi.fn()
        const { user } = render(
            <StatusDurationUnitSelect
                {...defaultProps}
                value="minutes"
                onChange={onChange}
            />,
        )

        const input = screen.queryAllByDisplayValue('Minutes')[0]
        await act(() => user.click(input))

        const hoursOptions = screen.queryAllByText('Hours')
        const lastHoursOption = hoursOptions[hoursOptions.length - 1]
        await act(() => user.click(lastHoursOption))

        expect(onChange).toHaveBeenCalledWith('hours')
    })

    it('should display error message when provided', () => {
        render(
            <StatusDurationUnitSelect
                {...defaultProps}
                error="Invalid unit selected"
            />,
        )

        expect(screen.getByText('Invalid unit selected')).toBeInTheDocument()
    })
})
