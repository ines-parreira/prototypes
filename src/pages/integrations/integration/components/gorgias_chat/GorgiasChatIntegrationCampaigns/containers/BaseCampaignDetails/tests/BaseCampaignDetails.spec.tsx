import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import {BaseCampaignDetails} from '../BaseCampaignDetails'

const integration = fromJS({
    type: 'gorgias_chat',
    id: '1',
    name: 'Unit Test Chat',
})

describe('<BaseCampaignDetails />', () => {
    it('matches snapshot', () => {
        const {container} = render(
            <BaseCampaignDetails integration={integration}>
                <div>content</div>
            </BaseCampaignDetails>
        )

        expect(container).toMatchSnapshot()
    })
})
