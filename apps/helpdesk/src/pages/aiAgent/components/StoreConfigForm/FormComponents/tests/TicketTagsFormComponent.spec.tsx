import {
    fireEvent,
    queryByDisplayValue,
    render,
    within,
} from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'
import { assumeMock } from 'utils/testing'

import { Props, TicketTagsFormComponent } from '../TicketTagsFormComponent'

jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('hooks/useAppDispatch', () => () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)

describe('TicketTagsFormComponent', () => {
    useAppSelectorMock.mockReturnValue({
        1: { id: '1', name: 'Tag1', description: 'Desc1' },
        2: { id: '2', name: 'Tag2', description: 'Desc2' },
        3: { id: '3', name: 'Tag3', description: 'Desc3' },
    })

    const updateValueMock = jest.fn()
    const mockProps = {
        tags: [{ name: 'Tag1', description: 'Desc1' }],
        updateValue: updateValueMock,
    } as Props

    beforeEach(() => {
        jest.restoreAllMocks()
    })

    describe('Store configuration Ticket tags', () => {
        it('Should automatically render store configuration stored ticket tags', () => {
            const { container } = render(
                <TicketTagsFormComponent {...mockProps} />,
            )

            const storeTagList =
                within(container).queryByTestId('store-tag-list')

            expect(storeTagList).toBeDefined()
        })
        it('Each store configuration ticket tag can be delete through the delete button next to it', () => {
            const { container, rerender } = render(
                <TicketTagsFormComponent {...mockProps} />,
            )

            const deleteButton = within(container).getByTestId(
                'ticket-tag-row-delete-button',
            )
            fireEvent.click(deleteButton)

            expect(updateValueMock).toHaveBeenNthCalledWith(1, 'tags', [])

            rerender(<TicketTagsFormComponent {...mockProps} tags={[]} />)

            expect(
                queryByDisplayValue(container, 'Tag1'),
            ).not.toBeInTheDocument()
        })
        it('should update the value of the description', async () => {
            const { container } = render(
                <TicketTagsFormComponent {...mockProps} />,
            )

            const descriptionInput =
                within(container).getByDisplayValue('Desc1')

            fireEvent.change(descriptionInput, {
                target: { value: 'New description' },
            })
            expect(updateValueMock).toHaveBeenNthCalledWith(1, 'tags', [
                { description: 'New description', name: 'Tag1' },
            ])
        })
    })
    describe('Select filter', () => {
        it('The select filter component is rendered with "Add Ticket Tags" as its title"', () => {
            const { container } = render(
                <TicketTagsFormComponent {...mockProps} />,
            )

            expect(
                within(container).getByText('Add Ticket Tag'),
            ).toBeInTheDocument()
        })
        it('The search placeholder should be "Search Ticket Tags"', () => {
            const { container } = render(
                <TicketTagsFormComponent {...mockProps} />,
            )

            const dropDownButton = within(container).getByText('Add Ticket Tag')

            fireEvent.click(dropDownButton)

            expect(
                within(container).getByPlaceholderText('Search Ticket Tags'),
            ).toBeInTheDocument()
        })

        describe('On close', () => {
            it('Selected tags should be appended to the store configuration custom tags', () => {
                const { container } = render(
                    <TicketTagsFormComponent {...mockProps} />,
                )

                const toggleButton =
                    within(container).getByText('Add Ticket Tag')
                fireEvent.click(toggleButton)

                const tag2CheckBox = within(container).getByLabelText('Tag2')
                fireEvent.click(tag2CheckBox)

                fireEvent.mouseDown(document.body)
                fireEvent.click(document.body)

                expect(updateValueMock).toHaveBeenNthCalledWith(1, 'tags', [
                    { name: 'Tag1', description: expect.any(String) },
                    { name: 'Tag2', description: expect.any(String) },
                ])
            })
            it('Selected fields should not re-appear in available selectable custom fields', () => {
                const { container } = render(
                    <TicketTagsFormComponent {...mockProps} />,
                )

                expect(within(container).queryByLabelText('Tag1')).toBeNull()
            })
        })
        describe('All selectable custom fields have been checked', () => {
            it('The add button should be disabled', () => {
                const { container } = render(
                    <TicketTagsFormComponent
                        {...mockProps}
                        tags={[
                            { name: 'Tag1', description: 'Desc1' },
                            { name: 'Tag2', description: 'Desc2' },
                            { name: 'Tag3', description: 'Desc3' },
                        ]}
                    />,
                )

                expect(
                    within(container).getByRole('button', {
                        name: 'Add Ticket Tag',
                    }),
                ).toBeDisabled()
            })
        })
    })
})
