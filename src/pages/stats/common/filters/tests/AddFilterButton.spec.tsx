import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {FilterKey} from 'models/stat/types'
import {AddFilterButton} from 'pages/stats/common/filters/AddFilterButton'

describe('AddFilterButton', () => {
    it('should list options and select one on Click', () => {
        const onClickSpy = jest.fn()
        const firstOption = {label: 'someLabel', value: FilterKey.Period}
        const options = [
            firstOption,
            {label: 'someOtherLabel', value: FilterKey.HelpCenters},
        ]

        render(<AddFilterButton onClick={onClickSpy} options={options} />)
        const button = screen.getByRole('button')
        userEvent.click(button)

        options.forEach((option) => {
            expect(screen.getByText(option.label)).toBeInTheDocument()
        })

        userEvent.click(screen.getByText(firstOption.label))
        expect(onClickSpy).toHaveBeenCalledWith(firstOption.value)
    })
})
