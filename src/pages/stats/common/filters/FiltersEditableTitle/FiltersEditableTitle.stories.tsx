import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {FiltersEditableTitle} from 'pages/stats/common/filters/FiltersEditableTitle/FiltersEditableTitle'

const storyConfig: Meta = {
    component: FiltersEditableTitle,
    title: 'Stats/Filters/FiltersEditableTitle',
}

const Template: Story<ComponentProps<typeof FiltersEditableTitle>> = (
    props
) => {
    return (
        <Provider store={configureMockStore()({})}>
            <FiltersEditableTitle {...props} />
        </Provider>
    )
}

export const Default = Template.bind({})

Default.args = {
    title: 'Team 1 Filter',
    isEditMode: false,
    errorType: 'non-existent',
}

export const DefaultWithError = Template.bind({})

DefaultWithError.args = {
    title: 'Team 2 Filter',
    isEditMode: true,
    error: 'Tags Filter is already in use. Please create another name for your saved filters.',
}

export default storyConfig
