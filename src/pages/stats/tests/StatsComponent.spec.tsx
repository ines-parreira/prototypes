import React from 'react'
import {fromJS} from 'immutable'
import moment from 'moment'

import {StatsComponentContainer} from '../StatsComponent'
import {renderWithRouter} from '../../../utils/testing'

jest.mock('../StatsFilters.js', () => () => 'StatsFilters')
jest.mock('../Stats.js', () => () => 'Stats')

describe('<StatsComponent />', () => {
    it('should render', () => {
        const {container} = renderWithRouter(
            <StatsComponentContainer
                globalFilters={fromJS({
                    period: {
                        start_date: moment(),
                        end_date: moment(),
                    },
                    integrations: [1],
                })}
            />,
            {
                path: '/foo/:view?',
                route: '/foo/1',
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
