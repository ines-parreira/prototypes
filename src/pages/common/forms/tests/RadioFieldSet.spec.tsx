import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import RadioFieldSet from '../RadioFieldSet'

describe('<RadioFieldSet />', () => {
    const minProps = {
        options: [
            {
                label: 'sushis and sashimis',
                value: 'japanese',
            },
            {
                label: 'tacos and nachos',
                value: 'mexican',
            },
        ],
        selectedValue: 'japanese',
        onChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('render()', () => {
        it('should render an enabled Radio field', () => {
            const {container} = render(<RadioFieldSet {...minProps} />)

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a Radio field with label', () => {
            const {container} = render(
                <RadioFieldSet {...minProps} label="I am labelled" />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a disabled RadioField', () => {
            const {container} = render(
                <RadioFieldSet {...minProps} isDisabled />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render captions under radio buttons', () => {
            const {container} = render(
                <RadioFieldSet
                    {...minProps}
                    options={minProps.options.map((option) => ({
                        ...option,
                        caption: `${option.value} food`,
                    }))}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('onChange()', () => {
        it('should call `onChange` when changing the value of the selected value', () => {
            const newValue = minProps.options[1]
            const {getByText} = render(<RadioFieldSet {...minProps} />)

            fireEvent.click(getByText(newValue.label))

            expect(minProps.onChange).toHaveBeenCalledWith(newValue.value)
        })

        it('should not call `onChange` when clicking on another value because the field is disabled', () => {
            const newValue = minProps.options[1]
            const {getByText} = render(
                <RadioFieldSet {...minProps} isDisabled />
            )

            fireEvent.click(getByText(newValue.label))

            expect(minProps.onChange).not.toHaveBeenCalledWith(newValue.value)
        })
    })
})
