import React, {ComponentProps, ContextType} from 'react'
import {Meta, Story} from '@storybook/react'
import _noop from 'lodash/noop'

import DropdownItem from './DropdownItem'
import {DropdownContext} from './Dropdown'

const mockContext: ContextType<typeof DropdownContext> = {
    isMultiple: false,
    value: null,
    query: '',
    onToggle: _noop,
    getHighlightedLabel: (string) => string,
    onQueryChange: _noop,
}

const storyConfig: Meta = {
    title: 'General/Dropdown/DropdownItem',
    component: DropdownItem,
}

const DefaultTemplate: Story<ComponentProps<typeof DropdownItem>> = (props) => (
    <DropdownContext.Provider value={mockContext}>
        <DropdownItem {...props} />
    </DropdownContext.Provider>
)

const defaultProps: Omit<ComponentProps<typeof DropdownItem>, 'onClick'> = {
    option: {label: 'Foo', value: 'foo'},
}

const defaultArgTypes = {
    onClick: {
        action: 'Clicked !',
    },
}

export const Default = DefaultTemplate.bind({})
Default.args = {
    ...defaultProps,
}

Default.argTypes = defaultArgTypes

const WithCheckBoxTemplate: Story<ComponentProps<typeof DropdownItem>> = (
    props
) => (
    <DropdownContext.Provider value={{...mockContext, isMultiple: true}}>
        <DropdownItem {...props} />
    </DropdownContext.Provider>
)

export const WithCheckBox = WithCheckBoxTemplate.bind({})
WithCheckBox.args = {
    ...defaultProps,
}

WithCheckBox.argTypes = defaultArgTypes

const WithSelectionTickTemplate: Story<ComponentProps<typeof DropdownItem>> = (
    props
) => (
    <DropdownContext.Provider
        value={{
            ...mockContext,
            value: defaultProps.option.value,
        }}
    >
        <DropdownItem {...props} />
    </DropdownContext.Provider>
)

export const WithSelectionTick = WithSelectionTickTemplate.bind({})
WithSelectionTick.args = {
    ...defaultProps,
}

WithSelectionTick.argTypes = defaultArgTypes

export default storyConfig
