import { assumeMock, getLastMockCall } from '@repo/testing'
import { render } from '@testing-library/react'
import { useFormContext } from 'react-hook-form'

import FormUnsavedChangesPrompt from 'pages/common/components/FormUnsavedChangesPrompt'

// eslint-disable-next-line no-unused-vars
const mockUnsavedChangesPrompt = jest.fn((_args: any) => (
    <div>UnsavedChangesPrompt</div>
))

jest.mock('pages/common/components/UnsavedChangesPrompt', () => {
    const { forwardRef } = jest.requireActual('react')

    return {
        __esModule: true,
        // oxlint-disable-next-line forward-ref-uses-ref
        default: forwardRef((props: any) =>
            mockUnsavedChangesPrompt(props as any),
        ),
    }
})

const mockNotify = {
    error: jest.fn(),
}
jest.mock('hooks/useNotify', () => ({
    useNotify: () => mockNotify,
}))

const useFormContextMock = assumeMock(useFormContext)

jest.mock('react-hook-form', () => ({
    ...jest.requireActual('react-hook-form'),
    useFormContext: jest.fn(),
}))

describe('FormUnsavedChangesPrompt', () => {
    const onSave = jest.fn()

    it('should render modal when form is dirty', () => {
        useFormContextMock.mockReturnValue({
            formState: {
                isDirty: true,
                isValid: true,
            },
            handleSubmit: jest.fn((callback) => callback),
        } as any)

        render(<FormUnsavedChangesPrompt onSave={onSave} />)

        expect(mockUnsavedChangesPrompt).toHaveBeenLastCalledWith(
            expect.objectContaining({
                when: true,
            }),
        )
    })

    it('should call onSave when form is valid', async () => {
        const handleSubmitMock = jest.fn((callback) => callback)
        useFormContextMock.mockReturnValue({
            formState: {
                isDirty: true,
                isValid: true,
            },
            handleSubmit: handleSubmitMock,
        } as any)

        render(<FormUnsavedChangesPrompt onSave={onSave} />)

        const handleOnSave = getLastMockCall(mockUnsavedChangesPrompt)[0].onSave

        await handleOnSave()

        expect(handleSubmitMock).toHaveBeenCalledWith(onSave)
        expect(onSave).toHaveBeenCalled()
    })

    it('should show error when form is invalid', async () => {
        useFormContextMock.mockReturnValue({
            formState: {
                isDirty: true,
                isValid: false,
            },
            handleSubmit: jest.fn(),
        } as any)

        render(<FormUnsavedChangesPrompt onSave={onSave} />)

        const handleOnSave = getLastMockCall(mockUnsavedChangesPrompt)[0].onSave

        await handleOnSave()

        expect(mockNotify.error).toHaveBeenCalledWith(
            'Please make sure all fields are filled out correctly before saving',
        )
        expect(onSave).not.toHaveBeenCalled()
    })
})
