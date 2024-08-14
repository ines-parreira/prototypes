import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {useForm} from 'react-hook-form'
import userEvent from '@testing-library/user-event'
import HttpRequestFormInput from '../components/HttpRequestFormInput'
import {getInputVariables} from '../utils'

const defaultValues = {
    httpUrl: 'https://test.com',
    httpMethod: 'GET',
    httpHeaders: [],
    httpBody: null,
    httpContentType: null,
    outputsDescription: '',
}

const invalidValues = {
    httpUrl: 'http://test.com',
    httpMethod: 'POST',
    httpHeaders: [{name: 'content-type', value: 'application/json'}],
    httpBody: 'bad json',
    httpContentType: 'application/json',
    outputsDescription: '',
}

const Form = (props: any) => {
    const {control} = useForm({
        ...props,
        mode: 'onBlur',
    })
    return (
        <form>
            <HttpRequestFormInput control={control} name="name" {...props} />
        </form>
    )
}

const inputVariables = getInputVariables([])

describe('HttpRequestFormInput', () => {
    it('renders form with valid state', async () => {
        const {getByText, getAllByRole, findByText} = render(
            <Form
                inputVariables={inputVariables}
                defaultValues={defaultValues}
            />
        )

        const urlInput = getAllByRole('textbox')[0]
        expect(urlInput).toBeInTheDocument()

        // change to method changes content type
        const methodSelect = getAllByRole('listbox')[0]
        expect(methodSelect).toBeInTheDocument()
        userEvent.click(methodSelect)
        userEvent.click(getAllByRole('option')[1])
        expect(getByText('POST')).toBeInTheDocument()

        const contentTypeSelect = getAllByRole('listbox')[1]
        expect(contentTypeSelect).toBeInTheDocument()
        expect(getByText('{}')).toBeInTheDocument()

        // change to content type changes body input
        userEvent.click(contentTypeSelect)
        userEvent.click(getAllByRole('option')[1])
        expect(
            getByText('application/x-www-form-urlencoded')
        ).toBeInTheDocument()
        userEvent.click(getByText('close'))

        const addBodyDataButton = getByText('Add body data', {exact: false})
        expect(addBodyDataButton).toBeInTheDocument()
        userEvent.click(methodSelect)
        userEvent.click(getAllByRole('option')[2])
        expect(getByText('PUT')).toBeInTheDocument()

        userEvent.click(addBodyDataButton)
        expect(getByText('Key and value pairs')).toBeInTheDocument()
        userEvent.click(getByText('close'))

        const addHeaderButton = getByText('Add header', {exact: false})
        expect(addHeaderButton).toBeInTheDocument()
        userEvent.click(addHeaderButton)
        expect(await findByText('Headers are invalid')).toBeInTheDocument()
        userEvent.click(getByText('close'))
    })

    it('renders form with invalid state', async () => {
        const {getAllByRole, findByText} = render(
            <Form
                inputVariables={inputVariables}
                defaultValues={invalidValues}
            />
        )

        const [urlInput, , , bodyInput] = getAllByRole('textbox')
        expect(urlInput).toBeInTheDocument()
        userEvent.click(urlInput)
        fireEvent.blur(urlInput)

        userEvent.click(bodyInput)
        fireEvent.blur(bodyInput)

        expect(
            await findByText('Only https protocol is allowed')
        ).toBeInTheDocument()

        expect(await findByText('Invalid JSON')).toBeInTheDocument()
    })
})
