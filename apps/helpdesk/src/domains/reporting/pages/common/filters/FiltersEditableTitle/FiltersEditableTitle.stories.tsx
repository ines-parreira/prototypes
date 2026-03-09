import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { FiltersEditableTitle } from 'domains/reporting/pages/common/filters/FiltersEditableTitle/FiltersEditableTitle'

const storyConfig: Meta<typeof FiltersEditableTitle> = {
    component: FiltersEditableTitle,
    title: 'Stats/Filters/FiltersEditableTitle',
}

type Story = StoryObj<typeof FiltersEditableTitle>

const Template: Story = {
    render: (props) => (
        <Provider store={configureMockStore()({})}>
            <FiltersEditableTitle {...props} />
        </Provider>
    ),
}

export const Default = {
    ...Template,
    args: {
        title: 'Team 1 Filter',
        isEditMode: false,
        errorType: 'non-existent',
    },
}

const DefaultWithErrorTemplate: Story = {
    render: (props) => (
        <Provider store={configureMockStore()({})}>
            <FiltersEditableTitle {...props} />
        </Provider>
    ),
}

export const DefaultWithError = {
    ...DefaultWithErrorTemplate,
    args: {
        title: 'Team 2 Filter',
        isEditMode: true,
        error: 'Tags Filter is already in use. Please create another name for your saved filters.',
    },
}

export default storyConfig
