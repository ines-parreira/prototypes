import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { DropdownSelector } from '../DropdownSelector'

type Item = {
    id: number
    label: string
}

const items: Item[] = [
    { id: 1, label: 'Item 1' },
    { id: 2, label: 'Item 2' },
    { id: 3, label: 'Item 3' },
]

const getItemKey = (item: Item) => item && item.id
const getItemLabel = (item: Item) => item && item.label

describe('DropdownSelector', () => {
    it('renders without crashing', () => {
        render(
            <DropdownSelector
                items={items}
                selectedKey={null}
                setSelectedKey={jest.fn()}
                selectedItem={null}
                getItemKey={getItemKey}
                getItemLabel={getItemLabel}
            />,
        )
        expect(
            screen.getByText('Select one or more chat items'),
        ).toBeInTheDocument()
    })

    it('opens the dropdown when clicked', () => {
        render(
            <DropdownSelector
                items={items}
                selectedKey={null}
                setSelectedKey={jest.fn()}
                selectedItem={null}
                getItemKey={getItemKey}
                getItemLabel={getItemLabel}
            />,
        )
        fireEvent.click(screen.getByText('Select one or more chat items'))
        expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('displays the correct items in the dropdown', () => {
        render(
            <DropdownSelector
                items={items}
                selectedKey={null}
                setSelectedKey={jest.fn()}
                selectedItem={null}
                getItemKey={getItemKey}
                getItemLabel={getItemLabel}
            />,
        )
        fireEvent.click(screen.getByText('Select one or more chat items'))
        items.forEach((item) => {
            expect(screen.getByText(item.label)).toBeInTheDocument()
        })
    })

    it('calls setSelectedKey with the correct value when an item is clicked', () => {
        const setSelectedKey = jest.fn()
        render(
            <DropdownSelector
                items={items}
                selectedKey={null}
                setSelectedKey={setSelectedKey}
                selectedItem={null}
                getItemKey={getItemKey}
                getItemLabel={getItemLabel}
            />,
        )
        fireEvent.click(screen.getByText('Select one or more chat items'))
        fireEvent.click(screen.getByText('Item 1'))
        expect(setSelectedKey).toHaveBeenCalledWith(1)
    })
})
