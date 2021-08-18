import React from 'react'
import {act, fireEvent, render} from '@testing-library/react'

import {LinkItem, Props} from '../LinkItem'

const ErrMessage = {
    invalidUrl: 'URL is invalid',
    missingUrl: 'Please enter a valid URL',
    missingLabel: 'Please enter a valid title',
}

const ControlledLinkItem = ({onChange, ...props}: Props) => {
    const [label, setLabel] = React.useState(props.label)
    const [value, setValue] = React.useState(props.value)

    const handleOnChange = (
        ev: React.ChangeEvent<HTMLInputElement>,
        type: 'label' | 'value',
        id: number
    ) => {
        if (type === 'value') {
            setValue(ev.target.value)
        }
        if (type === 'label') {
            setLabel(ev.target.value)
        }
        onChange(ev, type, id)
    }

    return (
        <LinkItem
            {...props}
            label={label}
            value={value}
            onChange={handleOnChange}
        />
    )
}

describe('<LinkItem>', () => {
    it('matches snapshot', () => {
        const {container} = render(
            <LinkItem
                key={'1-Test link-en-US'}
                id={1}
                value="https://test.com"
                label="Test link"
                onChange={jest.fn()}
                onDelete={jest.fn()}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('displays error if value is empty and label is not', () => {
        const {getByTestId} = render(
            <LinkItem
                key={'1-Test link-en-US'}
                id={1}
                value=""
                label="Test link"
                onChange={jest.fn()}
                onDelete={jest.fn()}
            />
        )

        expect(getByTestId('link-item-value-error-1').textContent).toEqual(
            ErrMessage.missingUrl
        )
    })

    it('displays error if label is empty and value is not', () => {
        const {getByTestId} = render(
            <LinkItem
                key={'1-Test link-en-US'}
                id={1}
                value="https://test.com"
                label=""
                onChange={jest.fn()}
                onDelete={jest.fn()}
            />
        )

        expect(getByTestId('link-item-label-error-1').textContent).toEqual(
            ErrMessage.missingLabel
        )
    })

    it('updates error message on change event', () => {
        const {getByTestId, queryByTestId} = render(
            <ControlledLinkItem
                key={'1-Test link-en-US'}
                id={1}
                value=""
                label=""
                onChange={jest.fn()}
                onDelete={jest.fn()}
            />
        )

        const labelInput = getByTestId('link-item-label-1') as HTMLInputElement
        const readLabelError = () => queryByTestId('link-item-label-error-1')

        const valueInput = getByTestId('link-item-value-1') as HTMLInputElement
        const readValueError = () => queryByTestId('link-item-value-error-1')

        // Check the pristine state
        // Expect empty values and no errors
        expect(labelInput.value).toEqual('')
        expect(valueInput.value).toEqual('')
        expect(readLabelError()).toBeNull()
        expect(readValueError()).toBeNull()

        // Input a link title and no link value
        // Expect missing error message for link input
        act(() => {
            fireEvent.change(labelInput, {target: {value: 'Home'}})
        })
        expect(labelInput.value).toEqual('Home')
        expect(valueInput.value).toEqual('')
        expect(readLabelError()).toBeNull()
        expect(readValueError()?.textContent).toEqual(ErrMessage.missingUrl)

        // Input an invalid link value along with the link title
        // Expect invalid error message for link input
        act(() => {
            fireEvent.change(valueInput, {target: {value: 'invalid'}})
        })
        expect(labelInput.value).toEqual('Home')
        expect(valueInput.value).toEqual('invalid')
        expect(readLabelError()).toBeNull()
        expect(readValueError()?.textContent).toEqual(ErrMessage.invalidUrl)

        // Reset the link title and keep the invalid link value
        // Expect missing error message for title input and keep invalid error message for link input
        act(() => {
            fireEvent.change(labelInput, {target: {value: ''}})
        })
        expect(labelInput.value).toEqual('')
        expect(valueInput.value).toEqual('invalid')
        expect(readLabelError()?.textContent).toEqual(ErrMessage.missingLabel)
        expect(readValueError()?.textContent).toEqual(ErrMessage.invalidUrl)

        // Input a valid title and a valid link
        // Expect no errors
        act(() => {
            fireEvent.change(labelInput, {target: {value: 'Home'}})
            fireEvent.change(valueInput, {
                target: {value: 'https://gorgias.com'},
            })
        })
        expect(labelInput.value).toEqual('Home')
        expect(valueInput.value).toEqual('https://gorgias.com')
        expect(readLabelError()).toBeNull()
        expect(readValueError()).toBeNull()
    })
})
