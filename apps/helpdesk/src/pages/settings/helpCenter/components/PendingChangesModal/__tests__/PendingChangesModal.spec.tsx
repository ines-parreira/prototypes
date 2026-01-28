import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PendingChangesModal from '../PendingChangesModal'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        block: jest.fn(),
        push: jest.fn(),
    }),
}))

describe('<PendingChangesModal />', () => {
    const handleOnSave = jest.fn()
    const handleOnEdit = jest.fn()
    const handleOnDiscard = jest.fn()

    beforeEach(() => {
        handleOnSave.mockClear()
        handleOnEdit.mockClear()
        handleOnDiscard.mockClear()
    })

    it('matches snapshot', () => {
        const { container } = render(
            <PendingChangesModal
                when={true}
                show
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            />,
            {
                container: document.body,
            },
        )

        expect(container).toMatchSnapshot()
    })

    it('has the correct wording', () => {
        const { getByText } = render(
            <PendingChangesModal
                when={true}
                show
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
                title="Title text"
                saveText="Save text button"
            />,
        )

        expect(getByText(/title text/i)).toBeInTheDocument()
        expect(getByText(/save text button/i)).toBeInTheDocument()
    })

    it('calls the onSave callback when provided', async () => {
        const { getByRole } = render(
            <PendingChangesModal
                when={true}
                show
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            />,
        )

        await act(async () => {
            await userEvent.click(getByRole('button', { name: /save/i }))
        })

        expect(handleOnSave).toHaveBeenCalled()
    })

    it('calls the onContinueEditing callback', async () => {
        const { getByRole } = render(
            <PendingChangesModal
                when={true}
                show
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            />,
        )
        await act(async () => {
            await userEvent.click(
                getByRole('button', { name: /back to editing/i }),
            )
        })

        expect(handleOnEdit).toHaveBeenCalled()
    })

    it('calls the onDiscard callback', async () => {
        const { getByRole } = render(
            <PendingChangesModal
                when={true}
                show
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            />,
        )
        await act(async () => {
            await userEvent.click(getByRole('button', { name: /discard/i }))
        })

        expect(handleOnDiscard).toHaveBeenCalled()
    })

    it('does not render save button when onSave is undefined but renders other buttons', () => {
        const { queryByRole, getByRole } = render(
            <PendingChangesModal
                when={true}
                show
                onSave={undefined}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            />,
        )

        expect(queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
        expect(getByRole('button', { name: /discard/i })).toBeInTheDocument()
        expect(
            getByRole('button', { name: /back to editing/i }),
        ).toBeInTheDocument()
    })
})
