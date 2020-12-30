import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import SelectFilter from '../SelectFilter'

describe('SelectFilter', () => {
    const commonProps = {
        value: [],
        onChange: jest.fn(),
        items: [
            {label: 'Api', value: '1'},
            {label: 'Chat', value: '2'},
            {label: 'Email', value: '3'},
        ],
    }

    const groupProps = {
        groupLabel: 'Groups',
        groupValue: [],
        groups: [
            {label: 'Group 1', value: '1', itemValues: ['1', '2']},
            {label: 'Group 2', value: '2', itemValues: ['3', '2']},
            {label: 'Group 3', value: '3', itemValues: []},
        ],
        onGroupChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component without any item', () => {
        const {container} = render(<SelectFilter {...commonProps} items={[]} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the component with selectable items', () => {
        const {container} = render(<SelectFilter {...commonProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the component with selected items', () => {
        const {container} = render(
            <SelectFilter {...commonProps} value={['1', '2']} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should deselect the item because selection is not required', () => {
        const {getByText} = render(
            <SelectFilter {...commonProps} required={false} value={['1']} />
        )

        const newOption = getByText(commonProps.items[0].label)
        fireEvent.click(newOption)
        expect(newOption).not.toHaveProperty('checked')

        expect(commonProps.onChange).toHaveBeenNthCalledWith(1, [])
    })

    it('should not deselect the item because selection is required', () => {
        const {getByLabelText} = render(
            <SelectFilter {...commonProps} value={['1']} required />
        )

        const selectedItem = getByLabelText(commonProps.items[0].label)
        fireEvent.click(selectedItem)
        expect(selectedItem).toHaveProperty('checked')

        expect(commonProps.onChange).not.toHaveBeenCalled()
    })

    it('should deselect all items', () => {
        const {getByText} = render(
            <SelectFilter {...commonProps} value={['1', '2']} />
        )

        fireEvent.click(getByText(/Deselect all/i))

        expect(getByText(commonProps.items[0].label)).not.toHaveProperty(
            'checked'
        )
        expect(getByText(commonProps.items[1].label)).not.toHaveProperty(
            'checked'
        )
        expect(commonProps.onChange).toHaveBeenNthCalledWith(1, [])
    })

    it('should render the component with groups', () => {
        const {container} = render(
            <SelectFilter {...commonProps} {...groupProps} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should return expected values on new selected group', () => {
        const {getByLabelText} = render(
            <SelectFilter {...commonProps} {...groupProps} />
        )

        const newGroup = getByLabelText(groupProps.groups[0].label)
        fireEvent.click(newGroup)
        expect(newGroup).toHaveProperty('checked')

        expect(groupProps.onGroupChange).toHaveBeenNthCalledWith(1, ['1'])
        expect(commonProps.onChange).toHaveBeenNthCalledWith(1, ['1', '2'])
    })

    it('should return expected values on deselected group', () => {
        const {getByLabelText} = render(
            <SelectFilter
                {...commonProps}
                {...groupProps}
                value={['1', '2', '3']}
                groupValue={['1']}
            />
        )

        const selectedGroup = getByLabelText(groupProps.groups[0].label)
        expect(selectedGroup).toHaveProperty('checked')
        fireEvent.click(selectedGroup)

        expect(groupProps.onGroupChange).toHaveBeenNthCalledWith(1, [])
        expect(commonProps.onChange).toHaveBeenNthCalledWith(1, ['3'])
    })

    it('should display selected group in an indeterminate state', () => {
        const {getByLabelText} = render(
            <SelectFilter
                {...commonProps}
                {...groupProps}
                value={['1']}
                groupValue={['1']}
            />
        )

        const indeterminateGroup = getByLabelText(groupProps.groups[0].label)

        expect(indeterminateGroup).toHaveProperty('indeterminate')
    })
})
