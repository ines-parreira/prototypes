import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {shallow} from 'enzyme'

import AutoPopulateInput from '../AutoPopulateInput'

describe('<AutoPopulateInput />', () => {
    let onChange: jest.MockedFunction<any>

    beforeEach(() => {
        onChange = jest.fn()
    })

    describe('render()', () => {
        it('should render checked', () => {
            const component = shallow(
                <AutoPopulateInput
                    value={null}
                    populateLabel="Use the same as Title"
                    populateValue="I am a title"
                    onChange={onChange}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render unchecked', () => {
            const component = shallow(
                <AutoPopulateInput
                    value="Custom title"
                    populateLabel="Use the same as Title"
                    populateValue="I am a title"
                    onChange={onChange}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    it('should call onChange with a value that depends on the checkbox state', () => {
        const props = {
            populateLabel: 'Use the same as Title',
            populateValue: 'I am a title',
            onChange: onChange,
        }

        const {getByRole, rerender} = render(
            <AutoPopulateInput {...props} value={null} />
        )

        const input = getByRole('textbox') as HTMLInputElement
        const checkbox = getByRole('checkbox') as HTMLInputElement

        expect(input.value).toEqual('I am a title')
        expect(input.disabled).toEqual(true)
        expect(checkbox.checked).toEqual(true)

        fireEvent.click(checkbox)

        expect(onChange).toHaveBeenLastCalledWith('')

        rerender(<AutoPopulateInput {...props} value="" />)

        expect(input.value).toEqual('')
        expect(input.disabled).toEqual(false)
        expect(checkbox.checked).toEqual(false)

        fireEvent.change(input, {
            target: {
                value: 'Custom value',
            },
        })

        expect(onChange).toHaveBeenLastCalledWith('Custom value')

        rerender(<AutoPopulateInput {...props} value="Custom value" />)

        expect(input.value).toEqual('Custom value')
        expect(input.disabled).toEqual(false)
        expect(checkbox.checked).toEqual(false)

        fireEvent.click(checkbox)

        expect(onChange).toHaveBeenLastCalledWith(null)

        rerender(<AutoPopulateInput {...props} value={null} />)

        expect(input.value).toEqual(props.populateValue)
        expect(input.disabled).toEqual(true)
        expect(checkbox.checked).toEqual(true)
    })
})
