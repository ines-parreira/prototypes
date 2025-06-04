import { fireEvent, render, screen } from '@testing-library/react'

import { StoreTagComponent, StoreTagList } from '../StoreTagList'

// Sample tag data for tests.
const sampleTag = { name: 'Test Tag', description: 'Test description' }
const sampleTags = [
    { name: 'Tag1', description: 'Description1' },
    { name: 'Tag2', description: 'Description2' },
]

describe('StoreTagComponent', () => {
    let onDeleteMock: jest.Mock
    let onDescriptionUpdateMock: jest.Mock

    beforeEach(() => {
        onDeleteMock = jest.fn()
        onDescriptionUpdateMock = jest.fn()
    })

    it('renders with correct tag values', () => {
        render(
            <StoreTagComponent
                tag={sampleTag}
                onDelete={onDeleteMock}
                onDescriptionUpdate={onDescriptionUpdateMock}
            />,
        )

        const nameInput = screen.getByDisplayValue('Test Tag')
        const descriptionInput = screen.getByDisplayValue('Test description')

        expect(nameInput).toBeInTheDocument()
        expect(nameInput).toBeDisabled()
        expect(descriptionInput).toBeInTheDocument()
    })

    it('calls onDescriptionUpdate when description input is changed', () => {
        render(
            <StoreTagComponent
                tag={sampleTag}
                onDelete={onDeleteMock}
                onDescriptionUpdate={onDescriptionUpdateMock}
            />,
        )
        const descriptionInput = screen.getByDisplayValue('Test description')
        fireEvent.change(descriptionInput, {
            target: { value: 'New description' },
        })

        expect(onDescriptionUpdateMock).toHaveBeenCalledTimes(1)
        expect(onDescriptionUpdateMock).toHaveBeenCalledWith('New description')
    })

    it('calls onDelete when delete button is clicked', () => {
        render(
            <StoreTagComponent
                tag={sampleTag}
                onDelete={onDeleteMock}
                onDescriptionUpdate={onDescriptionUpdateMock}
            />,
        )
        const deleteButton = screen.getByTestId('ticket-tag-row-delete-button')
        fireEvent.click(deleteButton)

        expect(onDeleteMock).toHaveBeenCalledTimes(1)
    })
})

describe('StoreTagList', () => {
    let onDeleteMock: jest.Mock
    let onDescriptionUpdateMock: jest.Mock

    beforeEach(() => {
        onDeleteMock = jest.fn()
        onDescriptionUpdateMock = jest.fn()
    })

    it('renders header row and tag items', () => {
        render(
            <StoreTagList
                tags={sampleTags}
                onDelete={onDeleteMock}
                onDescriptionUpdate={onDescriptionUpdateMock}
            />,
        )

        // Check that header texts are rendered.
        expect(screen.getByText('Tag')).toBeInTheDocument()
        expect(screen.getByText('Description')).toBeInTheDocument()

        // Each tag should render a disabled name input.
        const nameInputs = screen.getAllByDisplayValue(/^Tag\d+$/)
        expect(nameInputs.length).toBe(sampleTags.length)
        expect(nameInputs[0]).toHaveValue('Tag1')
        expect(nameInputs[1]).toHaveValue('Tag2')
    })

    it('calls onDelete and onDescriptionUpdate with correct tag name', () => {
        render(
            <StoreTagList
                tags={sampleTags}
                onDelete={onDeleteMock}
                onDescriptionUpdate={onDescriptionUpdateMock}
            />,
        )

        // Get the description inputs and simulate a change.
        const descriptionInputs =
            screen.getAllByDisplayValue(/^Description\d+$/)
        fireEvent.change(descriptionInputs[0], {
            target: { value: 'Updated Description1' },
        })

        expect(onDescriptionUpdateMock).toHaveBeenCalledTimes(1)
        expect(onDescriptionUpdateMock).toHaveBeenCalledWith(
            'Tag1',
            'Updated Description1',
        )

        // Get the delete buttons and simulate a click.
        const deleteButtons = screen.getAllByTestId(
            'ticket-tag-row-delete-button',
        )
        fireEvent.click(deleteButtons[1])
        expect(onDeleteMock).toHaveBeenCalledTimes(1)
        expect(onDeleteMock).toHaveBeenCalledWith('Tag2')
    })
})
