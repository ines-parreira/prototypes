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

    it('should handle empty options array', () => {
        render(<Selector options={[]} value={null} onChange={jest.fn()} />)

        expect(screen.getByRole('group')).toBeInTheDocument()
        expect(screen.queryAllByRole('button')).toHaveLength(0)
    })

    it('should handle value not in options', () => {
        render(<Selector options={[1, 2, 3]} value={4} onChange={jest.fn()} />)

        expect(screen.getByRole('group')).toBeInTheDocument()
        const options = screen.getAllByRole('button')
        options.forEach((option) => {
            expect(option).not.toHaveClass('selectorOption--selected')
        })
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

    it('should handle interactions when not controlled', async () => {
        render(<Selector options={[1, 2, 3]} value={1} />)

        expect(screen.getByRole('group')).toBeInTheDocument()

        const options = screen.getAllByRole('button')

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

    it('should handle interactions when not controlled with custom onChange', async () => {
        const onChangeMock = jest.fn()

        render(
            <Selector options={[1, 2, 3]} value={1} onChange={onChangeMock} />,
        )

        expect(screen.getByRole('group')).toBeInTheDocument()

        const options = screen.getAllByRole('button')

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
        expect(onChangeMock).toHaveBeenCalledWith(1)
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

    it('should allow to unselect option when enableUnselect is set to true', async () => {
        function Wrapper() {
            const [val, setVal] = useState<number | undefined>(undefined)
            return (
                <Selector
                    options={[1, 2, 3]}
                    value={val}
                    onChange={setVal}
                    enableUnselect
                />
            )
        }
        render(<Wrapper />)

        expect(screen.getByRole('group')).toBeInTheDocument()

        const option = screen.getByText('1')

        await userEvent.click(option)
        expect(option).toHaveClass('selectorOption--selected')

        await userEvent.click(option)
        expect(option).not.toHaveClass('selectorOption--selected')
    })

    it('should select a different option when enableUnselect is true', async () => {
        const onChangeMock = jest.fn()
        render(
            <Selector
                options={[1, 2, 3]}
                value={1}
                onChange={onChangeMock}
                enableUnselect
            />,
        )

        const option1 = screen.getByText('1')
        const option2 = screen.getByText('2')

        // unselect option1
        await userEvent.click(option1)
        expect(option1).toHaveClass('selectorOption')

        await userEvent.click(option2)
        expect(option1).not.toHaveClass('selectorOption--selected')
        expect(option2).toHaveClass('selectorOption--selected')
        expect(onChangeMock).toHaveBeenCalledWith(2)
    })

    it('should not allow to unselect option when enableUnselect is set to false (default)', async () => {
        function Wrapper() {
            const [val, setVal] = useState<number | undefined>(undefined)
            return (
                <Selector options={[1, 2, 3]} value={val} onChange={setVal} />
            )
        }
        render(<Wrapper />)

        expect(screen.getByRole('group')).toBeInTheDocument()

        const option = screen.getByText('1')

        await userEvent.click(option)
        expect(option).toHaveClass('selectorOption--selected')

        await userEvent.click(option)
        expect(option).toHaveClass('selectorOption--selected')
    })
})
