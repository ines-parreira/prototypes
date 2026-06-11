import { assumeMock, getLastMockCall, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { useFormContext } from 'react-hook-form'

import { FormUnsavedChangesPrompt } from 'pages/common/components/FormUnsavedChangesPrompt'

// eslint-disable-next-line no-unused-vars
const mockUnsavedChangesPrompt = jest.fn((_args: any) => (
    <div>UnsavedChangesPrompt</div>
))

jest.mock('pages/common/components/UnsavedChangesPrompt', () => {
    const { forwardRef } = jest.requireActual('react')

    return {
        __esModule: true,
        // oxlint-disable-next-line forward-ref-uses-ref
        UnsavedChangesPrompt: forwardRef((props: any) =>
            mockUnsavedChangesPrompt(props as any),
        ),
    }
})

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
        const handleSubmitMock = jest.fn(
            (validCallback) => () => validCallback(),
        )
        useFormContextMock.mockReturnValue({
            formState: { isDirty: true },
            handleSubmit: handleSubmitMock,
        } as any)

        render(<FormUnsavedChangesPrompt onSave={onSave} />)

        const handleOnSave = getLastMockCall(mockUnsavedChangesPrompt)[0].onSave

        await handleOnSave()

        expect(handleSubmitMock).toHaveBeenCalledWith(
            onSave,
            expect.any(Function),
        )
        expect(onSave).toHaveBeenCalled()
    })

    it('should forward shouldRedirectAfterSave to UnsavedChangesPrompt', () => {
        useFormContextMock.mockReturnValue({
            formState: { isDirty: false },
            handleSubmit: jest.fn((callback) => () => callback()),
        } as any)

        render(
            <FormUnsavedChangesPrompt
                onSave={onSave}
                shouldRedirectAfterSave
            />,
        )

        expect(mockUnsavedChangesPrompt).toHaveBeenLastCalledWith(
            expect.objectContaining({ shouldRedirectAfterSave: true }),
        )
    })

    it('should not forward shouldRedirectAfterSave when not provided', () => {
        useFormContextMock.mockReturnValue({
            formState: { isDirty: false },
            handleSubmit: jest.fn((callback) => () => callback()),
        } as any)

        render(<FormUnsavedChangesPrompt onSave={onSave} />)

        expect(mockUnsavedChangesPrompt).toHaveBeenLastCalledWith(
            expect.objectContaining({ shouldRedirectAfterSave: undefined }),
        )
    })

    it('should show error when form is invalid', async () => {
        const handleSubmitMock = jest.fn(
            (_validCallback, invalidCallback) => () => invalidCallback(),
        )
        useFormContextMock.mockReturnValue({
            formState: { isDirty: true },
            handleSubmit: handleSubmitMock,
        } as any)

        render(<FormUnsavedChangesPrompt onSave={onSave} />)

        const handleOnSave = getLastMockCall(mockUnsavedChangesPrompt)[0].onSave

        await handleOnSave()

        const toastEl = await screen.findByRole('status', {
            name: 'Please make sure all fields are filled out correctly before saving',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        expect(onSave).not.toHaveBeenCalled()
    })
})
