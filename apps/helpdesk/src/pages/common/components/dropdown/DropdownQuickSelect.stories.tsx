import type { ComponentProps, ContextType } from 'react'

import _noop from 'lodash/noop'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { DropdownContext } from './Dropdown'
import DropdownQuickSelect from './DropdownQuickSelect'

const mockContext: ContextType<typeof DropdownContext> = {
    isMultiple: true,
    value: null,
    query: '',
    onToggle: _noop,
    getHighlightedLabel: (string) => string,
    onQueryChange: _noop,
}

const storyConfig: Meta = {
    title: 'General/Dropdown/DropdownQuickSelect',
    component: DropdownQuickSelect,
}

const DefaultTemplate: StoryObj<typeof DropdownQuickSelect> = {
    render: function DefaultTemplate(props) {
        return (
            <DropdownContext.Provider value={mockContext}>
                <DropdownQuickSelect {...props} />
            </DropdownContext.Provider>
        )
    },
}

const defaultProps: Omit<
    ComponentProps<typeof DropdownQuickSelect>,
    'onSelectAll' | 'onRemoveAll'
> = {
    addLabel: 'Select all',
    autoFocus: true,
    className: '',
    count: 2,
    removeLabel: 'Deselect all',
    shouldCloseOnSelect: false,
    values: ['tacos', 'pizza'],
}

const defaultArgTypes = {
    onRemoveAll: {
        action: 'Clicked !',
    },
    onSelectAll: {
        action: 'Clicked !',
    },
}

export const Default = {
    ...DefaultTemplate,
    args: defaultProps,
    argTypes: defaultArgTypes,
}

export const Selected = {
    ...DefaultTemplate,
    ...mockContext,
    value: ['tacos', 'pizza'],
    args: defaultProps,
    argTypes: defaultArgTypes,
}

export const Partial = {
    ...DefaultTemplate,
    ...mockContext,
    value: ['tacos'],
    args: defaultProps,
    argTypes: defaultArgTypes,
}

export default storyConfig
