import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import type KeyMetricStat from 'domains/reporting/pages/common/components/charts/KeyMetricStat/KeyMetricStat'
import MultiResourceKeyMetricStat from 'domains/reporting/pages/common/components/charts/KeyMetricStat/MultiResourceKeyMetricStat'
import { totalMessagesSent } from 'fixtures/stats'

jest.mock(
    'domains/reporting/pages/common/components/charts/KeyMetricStat/KeyMetricStat',
    () => (props: ComponentProps<typeof KeyMetricStat>) => {
        return JSON.stringify(props, null, 2)
    },
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
        const { container } = render(
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
            />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render KeyMetricStat with empty meta when no stats available', () => {
        const { container } = render(
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
            />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
