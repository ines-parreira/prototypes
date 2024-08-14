import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {useForm} from 'react-hook-form'
import ActionFormInputAiInstructions from '../components/ActionFormInputAiInstruction'

const Form = (props: any) => {
    const {control} = useForm({defaultValues: {name: ''}, mode: 'onBlur'})
    return (
        <form>
            <ActionFormInputAiInstructions
                control={control}
                name="name"
                {...props}
            />
        </form>
    )
}

describe('ActionFormInputAiInstructions', () => {
    it('renders the component with the provided caption and label', async () => {
        const caption = 'Describe what the Action does.'
        const label = 'AI Agent instructions'
        const errorMessage = 'Test Error Message'

        const {getByText, getByLabelText, findByText} = render(
            <Form rules={{required: errorMessage}} />
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
