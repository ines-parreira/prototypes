import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {RevenueStatsContainer} from '../RevenueStats'

jest.mock('../StatsComponent', () => () => 'StatsComponent')

describe('<RevenueStats />', () => {
    const minProps = {
        storeIntegrations: fromJS([{id: 1}]),
    } as ComponentProps<typeof RevenueStatsContainer>

    it('should render a stats component', () => {
        const {container} = render(<RevenueStatsContainer {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render restricted feature when missing integrations', () => {
        const {container} = render(
            <RevenueStatsContainer
                {...minProps}
                storeIntegrations={fromJS([])}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
