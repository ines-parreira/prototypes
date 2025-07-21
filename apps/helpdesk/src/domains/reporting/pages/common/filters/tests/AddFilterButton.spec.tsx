import React from 'react'

import { render, screen } from '@testing-library/react'

import { FilterKey } from 'domains/reporting/models/stat/types'
import { AddFilterButton } from 'domains/reporting/pages/common/filters/AddFilterButton'
import { userEvent } from 'utils/testing/userEvent'

describe('AddFilterButton', () => {
    it('should list options and select one on Click', () => {
        const onClickSpy = jest.fn()
        const firstOption = { label: 'someLabel', value: FilterKey.Period }
        const optionGroups = [
            {
                title: 'some section title',
                options: [
                    firstOption,
                    { label: 'someOtherLabel', value: FilterKey.HelpCenters },
                ],
            },
        ]

        render(
            <AddFilterButton
                onClick={onClickSpy}
                optionGroups={optionGroups}
            />,
        )
        const button = screen.getByRole('button')
        userEvent.click(button)

        optionGroups[0].options.forEach((option) => {
            expect(screen.getByText(option.label)).toBeInTheDocument()
        })

        userEvent.click(screen.getByText(firstOption.label))
        expect(onClickSpy).toHaveBeenCalledWith(firstOption.value)
    })
})
