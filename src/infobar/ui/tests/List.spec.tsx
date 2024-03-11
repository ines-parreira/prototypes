import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'

import {compare} from 'utils'
import {DEFAULT_LIST_ITEM_DISPLAYED_NUMBER} from 'infobar/config/template'

import List from '../List'

describe('List', () => {
    const defaultProps = {
        isDraggable: true,
        dataKey: '20-1-rpz',
        initialItemDisplayedNumber: 4,
        isEditing: false,
        listItems: [
            {id: 1, name: 'Item 1'},
            {id: 2, name: 'Item 2'},
            {id: 3, name: 'Item 3'},
            {id: 4, name: 'Item 4'},
            {id: 5, name: 'Item 5'},
        ],
        children: jest.fn(),
    }

    it('should return null provided list is empty', () => {
        const {container} = render(<List {...defaultProps} listItems={[]} />)
        expect(container.firstChild).toBeNull()
    })

    it('should set the correct class and data-key attributes', () => {
        const {container, rerender} = render(<List {...defaultProps} />)

        expect(container.firstChild).toHaveClass('draggable')
        expect(container.firstChild).toHaveAttribute(
            'data-key',
            defaultProps.dataKey
        )

        rerender(<List {...defaultProps} isDraggable={false} />)
        expect(container.firstChild).not.toHaveClass('draggable')
    })

    it('should call the render prop only with the correct amount of items', () => {
        const {rerender} = render(<List {...defaultProps} />)

        expect(defaultProps.children).toHaveBeenCalledTimes(1)
        expect(defaultProps.children).toHaveBeenCalledWith(
            defaultProps.listItems.slice(
                0,
                defaultProps.initialItemDisplayedNumber
            )
        )

        rerender(
            <List {...defaultProps} initialItemDisplayedNumber={undefined} />
        )
        expect(defaultProps.children).toHaveBeenLastCalledWith(
            defaultProps.listItems.slice(0, DEFAULT_LIST_ITEM_DISPLAYED_NUMBER)
        )
    })

    it('should call the render prop with sorted items', () => {
        const {rerender} = render(
            <List {...defaultProps} orderBy={{key: 'name', direction: 'ASC'}} />
        )

        expect(defaultProps.children).toHaveBeenCalledTimes(1)
        expect(defaultProps.children).toHaveBeenCalledWith(
            defaultProps.listItems
                .sort((a, b) => compare(a.name, b.name))
                .slice(0, defaultProps.initialItemDisplayedNumber)
        )

        rerender(
            <List
                {...defaultProps}
                orderBy={{key: 'name', direction: 'DESC'}}
            />
        )
        expect(defaultProps.children).toHaveBeenLastCalledWith(
            [...defaultProps.listItems]
                .sort((a, b) => compare(b.name, a.name))
                .slice(0, defaultProps.initialItemDisplayedNumber)
        )
    })

    it("should not have a 'more' button if there are no excluded items", () => {
        render(
            <List
                {...defaultProps}
                initialItemDisplayedNumber={defaultProps.listItems.length + 1}
            />
        )

        expect(screen.queryByText(/more/)).toBeNull()
    })

    it('should have a "more" button that increases the number of provided items ', () => {
        render(<List {...defaultProps} />)

        fireEvent.click(screen.getByText(/ more/))
        expect(defaultProps.children).toHaveBeenLastCalledWith(
            defaultProps.listItems.slice(
                0,
                defaultProps.initialItemDisplayedNumber * 2
            )
        )
    })

    describe('Edit mode', () => {
        it('should show only 1 item', () => {
            render(<List {...defaultProps} isEditing={true} />)

            expect(defaultProps.children).toHaveBeenLastCalledWith([
                defaultProps.listItems[0],
            ])
        })
        it('should have a count showing the number of hidden items', () => {
            render(<List {...defaultProps} isEditing={true} />)
            const hiddenItemsCount = defaultProps.listItems.length - 1
            expect(
                screen.getByText(`${hiddenItemsCount} more`)
            ).toBeInTheDocument()
        })
    })
})
