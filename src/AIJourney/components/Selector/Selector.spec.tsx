import React, { useState } from 'react'

import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { Selector } from './Selector'

describe('<Selector />', () => {
    it('should call onChange when clicking a selector option', async () => {
        const onChangeMock = jest.fn()
        render(<Selector options={[1, 2, 3]} onChange={onChangeMock} />)

        expect(screen.getByRole('group')).toBeInTheDocument()
        await userEvent.click(screen.getByText('1'))

        expect(onChangeMock).toHaveBeenCalledWith(1)
    })

    it('should highlight selected option', async () => {
        const ControlledSelector = () => {
            const [value, setValue] = useState<number | null>(null)
            return (
                <Selector
                    options={[1, 2, 3]}
                    value={value}
                    onChange={setValue}
                />
            )
        }

        render(<ControlledSelector />)

        expect(screen.getByRole('group')).toBeInTheDocument()

        const options = screen.getAllByRole('button')

        options.forEach((option) => {
            expect(option).toHaveClass('selectorOption')
            expect(option).not.toHaveClass('selectorOption--selected')
        })

        const selectedOption = screen.getByText('1')
        await userEvent.click(selectedOption)

        options.forEach((option) => {
            if (option.textContent !== '1') {
                expect(option).toHaveClass('selectorOption')
                expect(option).not.toHaveClass('selectorOption--selected')
            } else {
                expect(option).toHaveClass('selectorOption--selected')
            }
        })
    })

    it('should render highlighted selected option when value is not null', () => {
        render(<Selector options={[1, 2, 3]} value={2} onChange={jest.fn()} />)

        expect(screen.getByRole('group')).toBeInTheDocument()

        const options = screen.getAllByRole('button')
        options.forEach((option) => {
            if (option.textContent !== '2') {
                expect(option).toHaveClass('selectorOption')
                expect(option).not.toHaveClass('selectorOption--selected')
            } else {
                expect(option).toHaveClass('selectorOption--selected')
            }
        })
    })
})
