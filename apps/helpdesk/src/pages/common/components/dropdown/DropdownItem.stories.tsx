import type { ComponentProps, ContextType } from 'react'

import _noop from 'lodash/noop'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { DropdownContext } from './Dropdown'
import DropdownItem from './DropdownItem'

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

const DefaultTemplate: StoryObj<typeof DropdownItem> = {
    render: function DefaultTemplate(props) {
        return (
            <DropdownContext.Provider value={mockContext}>
                <DropdownItem {...props} />
            </DropdownContext.Provider>
        )
    },
}

const defaultProps: Omit<ComponentProps<typeof DropdownItem>, 'onClick'> = {
    option: { label: 'Foo', value: 'foo' },
}

const defaultArgTypes = {
    onClick: {
        action: 'Clicked !',
    },
}

export const Default = {
    ...DefaultTemplate,
    args: defaultProps,
}

const WithCheckBoxTemplate: StoryObj<typeof DropdownItem> = {
    render: function WithCheckBoxTemplate(props) {
        return (
            <DropdownContext.Provider
                value={{ ...mockContext, isMultiple: true }}
            >
                <DropdownItem {...props} />
            </DropdownContext.Provider>
        )
    },
}

export const WithCheckBox = {
    ...WithCheckBoxTemplate,
    args: defaultProps,
}

const WithSelectionTickTemplate: StoryObj<typeof DropdownItem> = {
    render: function WithSelectionTickTemplate(props) {
        return (
            <DropdownContext.Provider
                value={{
                    ...mockContext,
                    value: defaultProps.option.value,
                }}
            >
                <DropdownItem {...props} />
            </DropdownContext.Provider>
        )
    },
}

export const WithSelectionTick = {
    ...WithSelectionTickTemplate,
    args: defaultProps,
}

WithSelectionTick.argTypes = defaultArgTypes

export default storyConfig
