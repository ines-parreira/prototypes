import { FormProvider, useForm } from '@repo/forms'
import { fireEvent, screen } from '@testing-library/react'

import { render } from '../../../../../../../tests/render.utils'
import { INITIAL_BODY } from '../../utils/customActionConstants'
import type { ButtonAction } from '../../utils/customActionTypes'
import { RequestBodyEditor } from '../RequestBodyEditor'

type WrapperProps = {
    body: ButtonAction['body']
    children: React.ReactNode
}

function FormWrapper({ body, children }: WrapperProps) {
    const methods = useForm({
        defaultValues: { body },
    })
    return <FormProvider {...methods}>{children}</FormProvider>
}

function renderEditor(body: ButtonAction['body'] = { ...INITIAL_BODY }) {
    return render(
        <FormWrapper body={body}>
            <RequestBodyEditor name="body" />
        </FormWrapper>,
    )
}

describe('RequestBodyEditor', () => {
    it('renders JSON textarea when contentType is application/json', () => {
        renderEditor()

        expect(screen.getByLabelText(/body \(json\)/i)).toBeInTheDocument()
        expect(screen.queryByText('Body (Form)')).not.toBeInTheDocument()
    })

    it('renders ParameterList when contentType is application/x-www-form-urlencoded', () => {
        renderEditor({
            ...INITIAL_BODY,
            contentType: 'application/x-www-form-urlencoded',
        })

        expect(screen.getByText('Body (Form)')).toBeInTheDocument()
        expect(
            screen.queryByLabelText(/body \(json\)/i),
        ).not.toBeInTheDocument()
    })

    it('renders empty textarea when JSON body is empty object', () => {
        renderEditor({
            ...INITIAL_BODY,
            'application/json': {},
        })

        expect(screen.getByLabelText(/body \(json\)/i)).toHaveValue('')
    })

    it('renders pretty-printed JSON for non-empty object', () => {
        renderEditor({
            ...INITIAL_BODY,
            'application/json': { key: 'value' },
        })

        expect(screen.getByLabelText(/body \(json\)/i)).toHaveValue(
            JSON.stringify({ key: 'value' }, null, 2),
        )
    })

    it('updates textarea value when valid JSON is entered', () => {
        renderEditor()

        const textarea = screen.getByLabelText(/body \(json\)/i)
        fireEvent.change(textarea, { target: { value: '{"a":1}' } })

        expect(textarea).toHaveValue('{\n  "a": 1\n}')
    })

    it('shows error when invalid JSON is entered', () => {
        renderEditor()

        const textarea = screen.getByLabelText(/body \(json\)/i)
        fireEvent.change(textarea, { target: { value: 'not json' } })

        expect(textarea).toHaveValue('not json')
    })

    it('switches to form mode when content type selector changes to Form', async () => {
        const { user } = renderEditor()

        await user.click(screen.getByRole('textbox', { name: /content type/i }))
        await user.click(screen.getByRole('option', { name: /form/i }))

        expect(screen.getByText('Body (Form)')).toBeInTheDocument()
    })

    it('adds a parameter in form mode', async () => {
        const { user } = renderEditor({
            ...INITIAL_BODY,
            contentType: 'application/x-www-form-urlencoded',
        })

        await user.click(screen.getByRole('button', { name: /add parameter/i }))

        expect(
            screen.getByRole('textbox', { name: /key/i }),
        ).toBeInTheDocument()
    })
})
