import { FormProvider, useForm } from '@repo/forms'
import { screen, waitFor } from '@testing-library/react'

import { render } from '../../../../../../../tests/render.utils'
import type { Parameter } from '../../utils/customActionTypes'
import { ParameterList } from '../ParameterList'

function makeParam(overrides: Partial<Parameter> = {}): Parameter {
    return {
        id: crypto.randomUUID(),
        key: '',
        value: '',
        type: 'text',
        label: '',
        editable: false,
        mandatory: false,
        ...overrides,
    }
}

type WrapperProps = {
    parameters: Parameter[]
    children: React.ReactNode
}

function FormWrapper({ parameters, children }: WrapperProps) {
    const methods = useForm({
        defaultValues: { items: parameters },
    })
    return <FormProvider {...methods}>{children}</FormProvider>
}

function renderParameterList(parameters: Parameter[] = []) {
    return render(
        <FormWrapper parameters={parameters}>
            <ParameterList name="items" label="Headers" />
        </FormWrapper>,
    )
}

describe('ParameterList', () => {
    it('does not render column headers when parameters are empty', () => {
        renderParameterList()

        expect(screen.getByText('Headers')).toBeInTheDocument()
        expect(screen.queryByText('Type')).not.toBeInTheDocument()
        expect(screen.queryByText('Key')).not.toBeInTheDocument()
        expect(screen.queryByText('Value')).not.toBeInTheDocument()
    })

    it('renders column headers when parameters exist', () => {
        renderParameterList([
            makeParam({ key: 'x-api', value: '123', type: 'text' }),
        ])

        expect(screen.getByText('Type')).toBeInTheDocument()
        expect(screen.getByText('Label')).toBeInTheDocument()
        expect(screen.getByText('Key')).toBeInTheDocument()
        expect(screen.getByText('Value')).toBeInTheDocument()
        expect(screen.getByText('Editable')).toBeInTheDocument()
        expect(screen.getByText('Required')).toBeInTheDocument()
    })

    it('adds a new empty parameter when "Add parameter" is clicked', async () => {
        const { user } = renderParameterList()

        await user.click(screen.getByRole('button', { name: /add parameter/i }))

        expect(screen.getByText('Type')).toBeInTheDocument()
        expect(screen.getByRole('textbox', { name: /key/i })).toHaveValue('')
    })

    it('adds to existing parameters when "Add parameter" is clicked', async () => {
        const { user } = renderParameterList([
            makeParam({ key: 'auth', value: 'token', type: 'text' }),
        ])

        await user.click(screen.getByRole('button', { name: /add parameter/i }))

        const keyInputs = screen.getAllByRole('textbox', { name: /key/i })
        expect(keyInputs).toHaveLength(2)
        expect(keyInputs[0]).toHaveValue('auth')
        expect(keyInputs[1]).toHaveValue('')
    })

    it('removes the parameter at the given index', async () => {
        const { user } = renderParameterList([
            makeParam({ key: 'first', value: '1', type: 'text' }),
            makeParam({ key: 'second', value: '2', type: 'text' }),
        ])

        const removeButtons = screen.getAllByRole('button', { name: /remove/i })
        await user.click(removeButtons[0])

        const keyInputs = screen.getAllByRole('textbox', { name: /key/i })
        expect(keyInputs).toHaveLength(1)
        expect(keyInputs[0]).toHaveValue('second')
    })

    it('updates a field value when typed into', async () => {
        const { user } = renderParameterList([makeParam()])

        const keyInput = screen.getByRole('textbox', { name: /key/i })
        await user.type(keyInput, 'x-api-key')

        expect(keyInput).toHaveValue('x-api-key')
    })

    it('sets editable to true when type is changed to dropdown', async () => {
        const { user } = renderParameterList([makeParam({ key: 'field' })])

        const typeSelect = screen.getAllByDisplayValue('Text')[0]
        await user.click(typeSelect)
        const dropdownOption = await screen.findByRole('option', {
            name: 'Dropdown',
        })
        await user.click(dropdownOption)

        await waitFor(() => {
            const switches = screen.getAllByRole('switch')
            expect(switches[0]).toBeChecked()
        })
    })

    it('sets mandatory to false when editable is toggled off', async () => {
        const { user } = renderParameterList([
            makeParam({ key: 'field', editable: true, mandatory: true }),
        ])

        const switches = screen.getAllByRole('switch')
        await user.click(switches[0])

        await waitFor(() => {
            const updatedSwitches = screen.getAllByRole('switch')
            expect(updatedSwitches[0]).not.toBeChecked()
            expect(updatedSwitches[1]).not.toBeChecked()
        })
    })
})
