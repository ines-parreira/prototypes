import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import {totalMessagesSent} from 'fixtures/stats'

import MultiResourceKeyMetricStat from '../KeyMetricStat/MultiResourceKeyMetricStat'
import KeyMetricStat from '../KeyMetricStat/KeyMetricStat'

jest.mock(
    '../KeyMetricStat/KeyMetricStat',
    () => (props: ComponentProps<typeof KeyMetricStat>) => {
        return JSON.stringify(props, null, 2)
    }
)

describe('MultiResourceKeyMetricStat', () => {
    const defaultConfig = {
        style: 'key-metrics',
        metrics: [
            fromJS({
                api_resource_name: 'foo',
                name: 'foo',
                tooltip: 'foo',
            }),
            fromJS({
                api_resource_name: 'bar',
                name: 'bar',
                tooltip: 'bar',
            }),
        ],
    }

    it('should render KeyMetricStat', () => {
        const {container} = render(
            <MultiResourceKeyMetricStat
                resourceStats={[
                    {
                        resourceName: 'foo',
                        isFetching: true,
                        stat: null,
                    },
                    {
                        resourceName: 'bar',
                        isFetching: false,
                        stat: totalMessagesSent,
                    },
                ]}
                config={fromJS(defaultConfig)}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render KeyMetricStat with empty meta when no stats available', () => {
        const {container} = render(
            <MultiResourceKeyMetricStat
                resourceStats={[
                    {
                        resourceName: 'foo',
                        isFetching: true,
                        stat: null,
                    },
                    {
                        resourceName: 'bar',
                        isFetching: true,
                        stat: null,
                    },
                ]}
                config={fromJS(defaultConfig)}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
