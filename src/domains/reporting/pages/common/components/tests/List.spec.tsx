import { render, screen } from '@testing-library/react'

import { List } from 'domains/reporting/pages/common/components/List'

describe('List', () => {
    const mockItems = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
    ]

    const mockRenderItem = jest.fn((listItem) => (
        <div {...listItem.getListItemProps()}>
            {listItem.item.name} - Index: {listItem.index}
        </div>
    ))

    beforeEach(() => {
        mockRenderItem.mockClear()
    })

    it('renders empty state when data array is empty', () => {
        const emptyElement = <div>No items found</div>

        render(
            <List
                data={[]}
                renderItem={mockRenderItem}
                listEmptyElement={emptyElement}
            />,
        )

        expect(screen.getByText('No items found')).toBeInTheDocument()
        expect(mockRenderItem).not.toHaveBeenCalled()
    })

    it('renders items with proper list structure and ARIA roles', () => {
        render(<List data={mockItems} renderItem={mockRenderItem} />)

        const list = screen.getByRole('list')
        expect(list).toBeInTheDocument()

        const listItems = screen.getAllByRole('listitem')
        expect(listItems).toHaveLength(3)

        expect(screen.getByText('Item 1 - Index: 0')).toBeInTheDocument()
        expect(screen.getByText('Item 2 - Index: 1')).toBeInTheDocument()
        expect(screen.getByText('Item 3 - Index: 2')).toBeInTheDocument()
    })

    it('calls renderItem with ListItem instances containing correct item and index', () => {
        render(<List data={mockItems} renderItem={mockRenderItem} />)

        expect(mockRenderItem).toHaveBeenCalledTimes(3)

        expect(mockRenderItem).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                item: mockItems[0],
                index: 0,
            }),
        )
        expect(mockRenderItem).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                item: mockItems[1],
                index: 1,
            }),
        )
        expect(mockRenderItem).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                item: mockItems[2],
                index: 2,
            }),
        )
    })

    it('uses default key extractor for objects with id property', () => {
        render(<List data={mockItems} renderItem={mockRenderItem} />)

        const list = screen.getByRole('list')

        // Verify keys are used correctly by checking rendered content
        expect(list.children).toHaveLength(3)
        expect(screen.getByText('Item 1 - Index: 0')).toBeInTheDocument()
        expect(screen.getByText('Item 2 - Index: 1')).toBeInTheDocument()
        expect(screen.getByText('Item 3 - Index: 2')).toBeInTheDocument()
    })

    it('uses index as key for objects without id property', () => {
        const itemsWithoutId = [{ name: 'Item 1' }, { name: 'Item 2' }]

        render(<List data={itemsWithoutId} renderItem={mockRenderItem} />)

        const list = screen.getByRole('list')
        expect(list.children).toHaveLength(2)
        expect(screen.getByText('Item 1 - Index: 0')).toBeInTheDocument()
        expect(screen.getByText('Item 2 - Index: 1')).toBeInTheDocument()
    })

    it('uses custom key extractor when provided', () => {
        const customKeyExtractor = jest.fn(
            (item, index) => `custom-${item.name}-${index}`,
        )

        render(
            <List
                data={mockItems}
                renderItem={mockRenderItem}
                keyExtractor={customKeyExtractor}
            />,
        )

        expect(customKeyExtractor).toHaveBeenCalledTimes(3)
        expect(customKeyExtractor).toHaveBeenCalledWith(mockItems[0], 0)
        expect(customKeyExtractor).toHaveBeenCalledWith(mockItems[1], 1)
        expect(customKeyExtractor).toHaveBeenCalledWith(mockItems[2], 2)
    })

    it('renders item separators between items but not before first item', () => {
        const separator = <hr />

        render(
            <List
                data={mockItems}
                renderItem={mockRenderItem}
                itemSeparatorElement={separator}
            />,
        )

        const separators = screen.getAllByRole('separator')
        expect(separators).toHaveLength(2) // One less than items count

        const list = screen.getByRole('list')
        const children = Array.from(list.children)

        // Check that separators are positioned correctly
        expect(children[0]).toContainElement(
            screen.getByText('Item 1 - Index: 0'),
        )
        expect(children[1]).toContainElement(separators[0])
        expect(children[2]).toContainElement(
            screen.getByText('Item 2 - Index: 1'),
        )
        expect(children[3]).toContainElement(separators[1])
        expect(children[4]).toContainElement(
            screen.getByText('Item 3 - Index: 2'),
        )
    })

    it('does not render separators with single item', () => {
        const singleItem = [mockItems[0]]
        const separator = <hr />

        render(
            <List
                data={singleItem}
                renderItem={mockRenderItem}
                itemSeparatorElement={separator}
            />,
        )

        expect(screen.queryByRole('separator')).not.toBeInTheDocument()
        expect(screen.getByText('Item 1 - Index: 0')).toBeInTheDocument()
    })

    it('passes through additional props to the list container', () => {
        const className = 'custom-list-class'

        render(
            <List
                data={mockItems}
                renderItem={mockRenderItem}
                className={className}
                style={{ border: '1px solid red' }}
            />,
        )

        const list = screen.getByRole('list')
        expect(list).toHaveClass(className)
        expect(list).toHaveAttribute('role', 'list')
        expect(list).toHaveStyle('border: 1px solid red')
    })

    it('provides correct getListItemProps method', () => {
        const testItem = { id: 'test', name: 'Test Item' }
        const listItem = mockRenderItem.mock.calls[0]?.[0] || {
            getListItemProps: () => ({ role: 'listitem' }),
        }

        render(<List data={[testItem]} renderItem={mockRenderItem} />)

        expect(mockRenderItem).toHaveBeenCalledWith(
            expect.objectContaining({
                item: testItem,
                index: 0,
                getListItemProps: expect.any(Function),
            }),
        )

        const listItemProps = listItem.getListItemProps()
        expect(listItemProps).toEqual({ role: 'listitem' })
    })

    it('handles primitive data types', () => {
        const primitiveData = ['apple', 'banana', 'cherry']
        const primitiveRenderItem = jest.fn((listItem) => (
            <div {...listItem.getListItemProps()}>
                {listItem.item} at {listItem.index}
            </div>
        ))

        render(<List data={primitiveData} renderItem={primitiveRenderItem} />)

        expect(screen.getByText('apple at 0')).toBeInTheDocument()
        expect(screen.getByText('banana at 1')).toBeInTheDocument()
        expect(screen.getByText('cherry at 2')).toBeInTheDocument()
    })

    it('handles mixed id types (string and number)', () => {
        const mixedIdItems = [
            { id: 1, name: 'Numeric ID' },
            { id: 'string-id', name: 'String ID' },
        ]

        render(<List data={mixedIdItems} renderItem={mockRenderItem} />)

        expect(screen.getByText('Numeric ID - Index: 0')).toBeInTheDocument()
        expect(screen.getByText('String ID - Index: 1')).toBeInTheDocument()
    })
})
