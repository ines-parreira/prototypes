import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import QAScoreSelect from '../QAScoreSelect'

describe('<QAScoreSelect />', () => {
    const mockOnChange = jest.fn()

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render the SelectField component with correct props', () => {
        const { container } = render(
            <QAScoreSelect
                onChange={mockOnChange}
                value="language_proficiency"
            />,
        )

        const selectField = container.querySelector('.dropdown-toggle')
        expect(selectField).toBeInTheDocument()
        expect(selectField?.textContent).toContain('Language proficiency')
    })

    it('should call onChange with the first QA_SCORE_DIMENSIONS value if value is null', () => {
        render(<QAScoreSelect onChange={mockOnChange} value={null} />)

        expect(mockOnChange).toHaveBeenCalledWith('language_proficiency')
    })

    it('should call onChange when a new value is selected', () => {
        const { getByText } = render(
            <QAScoreSelect onChange={mockOnChange} value="accuracy" />,
        )

        const option = getByText('Brand voice')
        fireEvent.click(option)

        expect(mockOnChange).toHaveBeenCalledWith('brand_voice')
    })

    it('should not call onChange if value is already set', () => {
        render(
            <QAScoreSelect
                onChange={mockOnChange}
                value="language_proficiency"
            />,
        )

        expect(mockOnChange).not.toHaveBeenCalled()
    })
})
