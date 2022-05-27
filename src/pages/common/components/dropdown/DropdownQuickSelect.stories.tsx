import _noop from 'lodash/noop'
import React, {ComponentProps, ContextType} from 'react'
import {Meta, Story} from '@storybook/react'

import {DropdownContext} from './Dropdown'
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

const DefaultTemplate: (
    context?: ContextType<typeof DropdownContext>
) => Story<ComponentProps<typeof DropdownQuickSelect>> =
    (context = mockContext) =>
    (props) =>
        (
            <DropdownContext.Provider value={context}>
                <DropdownQuickSelect {...props} />
            </DropdownContext.Provider>
        )

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

export const Default = DefaultTemplate().bind({})
Default.args = defaultProps
Default.argTypes = defaultArgTypes

export const Selected = DefaultTemplate({
    ...mockContext,
    value: ['tacos', 'pizza'],
}).bind({})
Selected.args = defaultProps
Selected.argTypes = defaultArgTypes

export const Partial = DefaultTemplate({
    ...mockContext,
    value: ['tacos'],
}).bind({})
Partial.args = defaultProps
Partial.argTypes = defaultArgTypes

export default storyConfig
