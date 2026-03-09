import type { ComponentProps } from 'react'

import { within } from '@testing-library/react'
import type { Identifier } from 'estree'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'
import { userEvent } from 'storybook/test'

import { ThemeProvider } from 'core/theme'
import RightContainer from 'pages/common/components/ViewTable/Filters/Right'

const defaultState = {
    integrations: fromJS({
        integrations: [],
    }),
}

const storyConfig: Meta = {
    title: 'Data Display/ViewTable/RightContainer',
    component: RightContainer,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

const Template: StoryFn<ComponentProps<typeof RightContainer>> = (
    props: ComponentProps<typeof RightContainer>,
) => {
    return (
        <ThemeProvider>
            <Provider store={configureMockStore()(defaultState)}>
                <RightContainer {...props} />
            </Provider>
        </ThemeProvider>
    )
}

const defaultProps: ComponentProps<typeof RightContainer> = {
    agents: fromJS([]),
    config: fromJS({}),
    empty: false,

    field: fromJS({
        name: 'created',
        title: 'Created',
        path: 'created_datetime',
        filter: {
            sort: {
                created_datetime: 'desc',
            },
        },
    }),
    index: 0,
    objectPath: 'ticket.created_datetime',
    operator: {
        loc: {
            end: {
                line: 1,
                column: 3,
            },
            start: {
                line: 1,
                column: 0,
            },
        },
        name: 'gte',
        type: 'Identifier',
    } as Identifier,
    teams: fromJS([]),
    updateFieldFilter: () => ({
        type: 'someType',
        index: 0,
        value: 'someValue',
    }),
    node: {
        loc: {
            end: {
                line: 1,
                column: 54,
            },
            start: {
                line: 1,
                column: 29,
            },
        },
        raw: '2021-12-01T06:00:00.000Z',
        type: 'Literal',
        value: '2021-12-01T06:00:00.000Z',
    },
    storeMappings: [],
}

export const Default = Template.bind({})
Default.args = defaultProps

Default.play = ({ canvasElement }) => {
    const canvas = within(canvasElement)
    userEvent.click(canvas.getByRole('textbox'))
}

export default storyConfig
