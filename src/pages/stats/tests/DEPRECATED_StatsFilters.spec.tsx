import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {render, waitFor} from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import client from '../../../models/api/resources'
import {views} from '../../../config/stats'
import {agents as agentsFixtures} from '../../../fixtures/agents'
import {integrationsState} from '../../../fixtures/integrations'
import {tags as tagsFixtures} from '../../../fixtures/tag'
import {TagsState} from '../../../state/entities/tags/types'
import {StatsFiltersContainer} from '../DEPRECATED_StatsFilters'

jest.mock('../common/PeriodPicker', () => () => 'PeriodPicker')

describe('<StatsFilters />', () => {
    const mockedServer = new MockAdapter(client)

    const minProps = ({
        agents: agentsFixtures.map(({id, name}) => ({id, label: name})),
        channels: [],
        config: views.get('support-performance-overview'),
        currentAccount: fromJS({}),
        filters: fromJS({
            period: {
                start_datetime: '2021-05-29T00:00:00+02:00',
                end_datetime: '2021-06-04T23:59:59+02:00',
            },
        }),
        integrations: integrationsState.integrations,
        tags: tagsFixtures.reduce((tags: TagsState, tag) => {
            tags[tag.id.toString()] = tag
            return tags
        }, {}),
        teams: [],
        mergeStatsFilters: jest.fn(),
        tagsFetched: jest.fn(),
        notify: jest.fn(),
    } as unknown) as ComponentProps<typeof StatsFiltersContainer>

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should display the page', () => {
        const {container} = render(<StatsFiltersContainer {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should retrieve tags on first render', async () => {
        mockedServer.onGet('/api/tags/').reply(200, {
            data: tagsFixtures,
            meta: {
                current_page: 'url',
                item_count: 4,
                nb_pages: 1,
                page: 1,
                per_page: 30,
            },
            object: 'list',
        })

        render(<StatsFiltersContainer {...minProps} />)

        await waitFor(() =>
            expect(minProps.tagsFetched).toHaveBeenCalledWith(tagsFixtures)
        )
    })
})
