import type { ComponentProps } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { tags } from 'fixtures/tag'

import TableActions from '../TableActions/TableActions'

const mockStore = configureMockStore()

const defaultProps: ComponentProps<typeof TableActions> = {
    selectedTagsIds: fromJS([1, 2]),
    onMerge: jest.fn(),
    onBulkDelete: jest.fn(),
}

const defaultState = {
    tags: fromJS({
        items: tags,
    }),
}

describe('<TableActions />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('selected tags functionality', () => {
        it('should correctly format tag names with humanizeArray', () => {
            const threeTagsProps = {
                ...defaultProps,
                selectedTagsIds: fromJS([1, 2, 3]),
            }

            render(
                <Provider store={mockStore(defaultState)}>
                    <TableActions {...threeTagsProps} />
                </Provider>,
            )

            fireEvent.click(screen.getByText('Delete'))
            expect(
                screen.getByText(/refund, billing and rejected/),
            ).toBeInTheDocument()
        })

        it('should handle tags with special characters in names', () => {
            const specialTagsState = {
                tags: fromJS({
                    items: [
                        ...tags,
                        {
                            id: 5,
                            name: 'urgent-priority',
                            description: 'high priority',
                            usage: 5,
                        },
                        {
                            id: 6,
                            name: 'bug_fix',
                            description: 'bug fixes',
                            usage: 3,
                        },
                    ],
                }),
            }

            const specialTagsProps = {
                ...defaultProps,
                selectedTagsIds: fromJS([5, 6]),
            }

            render(
                <Provider store={mockStore(specialTagsState)}>
                    <TableActions {...specialTagsProps} />
                </Provider>,
            )

            fireEvent.click(screen.getByText('Delete'))
            expect(
                screen.getByText(/urgent-priority and bug_fix/),
            ).toBeInTheDocument()
        })
    })

    describe('button interactions', () => {
        it('should show merge confirmation popup on merge button click', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <TableActions {...defaultProps} />
                </Provider>,
            )

            fireEvent.click(screen.getByText('Merge'))
            expect(
                screen.getByText(/You are about to merge 1 tag/).textContent,
            ).toBe(
                'You are about to merge 1 tag (refund) into billing.This action cannot be undone.',
            )
        })

        it('should show delete confirmation popup on delete button click', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <TableActions {...defaultProps} />
                </Provider>,
            )

            fireEvent.click(screen.getByText('Delete'))
            expect(
                screen.getByText(/You are about to delete 2 tags/).textContent,
            ).toBe(
                'You are about to delete 2 tags: refund and billing.They will be removed from all tickets.Historical Statistics for these tags will be lost.It will not be possible to add the tags back on the tickets they were on.The tags will have to be removed from Saved Filters manually.',
            )
        })

        it('should call onMerge when merge is confirmed', () => {
            const onMerge = jest.fn()
            const props = { ...defaultProps, onMerge }

            render(
                <Provider store={mockStore(defaultState)}>
                    <TableActions {...props} />
                </Provider>,
            )

            fireEvent.click(screen.getByText('Merge'))
            fireEvent.click(screen.getByText('Confirm'))

            expect(onMerge).toHaveBeenCalledTimes(1)
        })

        it('should call onBulkDelete when delete is confirmed', () => {
            const onBulkDelete = jest.fn()
            const props = { ...defaultProps, onBulkDelete }

            render(
                <Provider store={mockStore(defaultState)}>
                    <TableActions {...props} />
                </Provider>,
            )

            fireEvent.click(screen.getByText('Delete'))
            fireEvent.click(screen.getByText('Confirm'))

            expect(onBulkDelete).toHaveBeenCalledTimes(1)
        })
    })

    describe('edge cases', () => {
        it('should handle undefined or null tag names gracefully', () => {
            const stateWithNullNames = {
                tags: fromJS({
                    items: [
                        { id: 1, name: null, description: 'test', usage: 0 },
                        {
                            id: 2,
                            name: undefined,
                            description: 'test',
                            usage: 0,
                        },
                        { id: 3, name: 'valid', description: 'test', usage: 0 },
                    ],
                }),
            }

            const props = {
                ...defaultProps,
                selectedTagsIds: fromJS([1, 2, 3]),
            }

            render(
                <Provider store={mockStore(stateWithNullNames)}>
                    <TableActions {...props} />
                </Provider>,
            )

            fireEvent.click(screen.getByText('Delete'))
            expect(
                screen.getByText(/You are about to delete 1 tag: valid/),
            ).toBeInTheDocument()
        })

        it('should handle empty tags state', () => {
            const emptyState = {
                tags: fromJS({
                    items: [],
                }),
            }

            render(
                <Provider store={mockStore(emptyState)}>
                    <TableActions {...defaultProps} />
                </Provider>,
            )

            const mergeButton = screen.getByText('Merge')
            const deleteButton = screen.getByText('Delete')
            expect(mergeButton).not.toBeDisabled()
            expect(deleteButton).not.toBeDisabled()
        })
    })
})
