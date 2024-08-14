import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {useForm} from 'react-hook-form'
import ActionFormInputName from '../components/ActionFormInputName'

const Form = (props: any) => {
    const {control} = useForm({defaultValues: {name: ''}, mode: 'onBlur'})
    return (
        <form>
            <ActionFormInputName control={control} name="name" {...props} />
        </form>
    )
}

describe('ActionFormInputName', () => {
    it('renders the component with the provided caption and label', async () => {
        const caption = 'Test Caption'
        const label = 'Test Label'
        const errorMessage = 'Test Error Message'

        const {getByText, getByLabelText, findByText} = render(
            <Form
                caption={caption}
                label={label}
                rules={{required: errorMessage}}
            />
        )

        expect(getByText(caption)).toBeInTheDocument()

        const input = getByLabelText(label, {exact: false})
        expect(input).toHaveAttribute('required')

        // Got caption
        expect(getByText(caption)).toBeInTheDocument()

        // Still got caption
        fireEvent.change(input, {target: {value: 'Test Value'}})
        fireEvent.blur(input)
        expect(getByText(caption)).toBeInTheDocument()

        // message if there's no value
        fireEvent.change(input, {target: {value: ''}})
        fireEvent.blur(input)
        expect(await findByText(errorMessage)).toBeInTheDocument()
    })
})
