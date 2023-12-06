import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'

import {LabelWithTooltip} from '../LabelWithTooltip'

jest.mock('state/ui/stats/actions', () => ({
    statFiltersClean: jest.fn(() => () => ({})),
    statFiltersDirty: jest.fn(() => () => ({})),
}))

describe('<LabelWithTooltip />', () => {
    const label = 'Label'

    it('should render label', () => {
        render(<LabelWithTooltip label={label} />)

        expect(screen.getByText(label)).toBeInTheDocument()
    })

    it('should render tooltip on hover label', () => {
        jest.useFakeTimers()
        render(<LabelWithTooltip label={label} />)

        fireEvent.mouseOver(screen.getByText(label))
        jest.runAllTimers()

        expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
})
