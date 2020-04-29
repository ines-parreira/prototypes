import React from 'react'
import {shallow} from 'enzyme'

import SearchableSelectField from '../SearchableSelectField'


describe('SearchableSelectField', () => {
    const commonProps = {
        input: {value: [], onChange: jest.fn()},
        items: [{label: 'Api', value: 1}, {label: 'Chat', value: 2}, {label: 'Email', value: 3}]
    }

    beforeEach(() => {
        commonProps.input.value = []
        jest.clearAllMocks()
    })

    it('should render the component without any item', () => {
        const component = shallow(
            <SearchableSelectField
                {...commonProps}
                items={[]}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render the component with selectable items', () => {
        const component = shallow(
            <SearchableSelectField
                {...commonProps}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render the component with selected items', () => {
        commonProps.input.value = [2, 3]
        const component = shallow(
            <SearchableSelectField
                {...commonProps}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should replace the selected item because multiple is deactivated', () => {
        const newSelectedItem = commonProps.items[1]
        commonProps.input.value = [commonProps.items[0].value]

        const component = shallow(
            <SearchableSelectField
                {...commonProps}
                multiple={false}
            />
        )
        const newItemTag = component.findWhere((tag) => {
            return tag.name() === 'DropdownItem' && tag.html().includes(newSelectedItem.label)
        })
        newItemTag.find('input').simulate('change', {target: {value: newSelectedItem.value}})

        expect(commonProps.input.onChange).toHaveBeenNthCalledWith(1, [newSelectedItem.value])
    })

    it('should deselect the item because selection is not required', () => {
        const SelectedItem = commonProps.items[1]
        commonProps.input.value = [SelectedItem.value]

        const component = shallow(
            <SearchableSelectField
                {...commonProps}
                required={false}
            />
        )
        const selectedItemTag = component.findWhere((tag) => {
            return tag.name() === 'DropdownItem' && tag.html().includes(SelectedItem.label)
        })
        selectedItemTag.find('input').simulate('change', {target: {value: SelectedItem.value}})

        expect(commonProps.input.onChange).toHaveBeenNthCalledWith(1, [])
    })

    it('should not deselect the item because selection is required', () => {
        const SelectedItem = commonProps.items[1]
        commonProps.input.value = [SelectedItem.value]

        const component = shallow(
            <SearchableSelectField
                {...commonProps}
                required
            />
        )
        const selectedItemTag = component.findWhere((tag) => {
            return tag.name() === 'DropdownItem' && tag.html().includes(SelectedItem.label)
        })
        selectedItemTag.find('input').simulate('change', {target: {value: SelectedItem.value}})

        expect(commonProps.input.onChange).not.toBeCalled()
    })

    it('should deselected all items', () => {
        commonProps.input.value = [commonProps.items[1].value, commonProps.items[0].value]
        const component = shallow(
            <SearchableSelectField
                {...commonProps}
            />
        )
        const deselectTag = component.findWhere((tag) => {
            return tag.name() === 'DropdownItem' && tag.key() === 'deselect'
        })
        deselectTag.simulate('click')

        expect(commonProps.input.onChange).toHaveBeenNthCalledWith(1,[])
    })
})
