import type { ComponentProps } from 'react'
import React from 'react'

import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import * as ticketFixtures from 'fixtures/ticket'
import { view as fixtureView } from 'fixtures/views'
import { EntityType } from 'models/view/types'
import { ViewTableContainer } from 'pages/common/components/ViewTable/ViewTable'
import { fetchViewItems, updateView } from 'state/views/actions'

const storyConfig: Meta = {
    title: 'Data Display/ViewTable/ViewTable',
    component: ViewTableContainer,
    decorators: [
        (story) => (
            <Provider
                store={configureMockStore([thunk])({
                    views: fromJS({
                        active: fromJS(fixtureView),
                    }),
                })}
            >
                <MemoryRouter>{story()}</MemoryRouter>
            </Provider>
        ),
    ],
}

const defaultProps = {
    type: EntityType.Ticket,
    isLoading: () => false,
    items: fromJS([ticketFixtures.ticket]),
    activeView: fromJS(fixtureView),
    config: fromJS({
        fields: [
            {
                name: 'details',
                title: 'Details',
            },
            {
                name: 'tags',
                title: 'Tags',
                path: 'tags.name',
                filter: {
                    type: 'tag',
                },
            },
            {
                name: 'customer',
                title: 'Customer',
                path: 'customer.id',
                filter: {
                    type: 'customer',
                },
            },
            {
                name: 'created',
                title: 'Created',
                path: 'created_datetime',
                filter: {
                    sort: {
                        created_datetime: 'desc',
                    },
                },
            },
            {
                name: 'id',
                title: 'Ticket ID',
            },
        ],
    }),
    fetchViewItems,
    updateView,
    navigation: fromJS({}),
    match: { params: {} },
    location: { search: '', pathname: '' },
    flags: {},
} as unknown as ComponentProps<typeof ViewTableContainer>

const Template: StoryFn<ComponentProps<typeof ViewTableContainer>> = (
    props,
) => {
    return <ViewTableContainer {...props} />
}

export const Default = Template.bind({})
Default.args = defaultProps

export const WithFilters = Template.bind({})
WithFilters.args = {
    ...defaultProps,
    isSearch: true,
    urlViewId: fixtureView.id.toString(),
    updateView,
    getViewIdToDisplay: () => null,
}

export default storyConfig
