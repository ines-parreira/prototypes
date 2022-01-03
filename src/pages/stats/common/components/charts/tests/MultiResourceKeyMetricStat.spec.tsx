import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import MultiResourceKeyMetricStat from '../KeyMetricStat/MultiResourceKeyMetricStat'
import {totalMessagesSent} from '../../../../../../fixtures/stats'

describe('MultiResourceKeyMetricStat', () => {
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
                config={fromJS({
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
                })}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
