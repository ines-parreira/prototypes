import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {BlankStateContainer} from '../BlankStateContainer.tsx'
import {user} from '../../../../../fixtures/users.ts'

const mockedStats = fromJS({
    data: {
        data: {
            lines: [
                [
                    {name: 'Steve', type: 'string'},
                    {value: 45, type: 'number'},
                ],
            ],
        },
    },
})

jest.mock('../../../../../services/gorgiasApi.ts', () => () => {
    return {
        getStatistic: jest.fn().mockResolvedValue(mockedStats),
        cancelPendingRequests: jest.fn(),
    }
})

describe('<BlankStateContainer />', () => {
    it('should display', () => {
        const {container} = render(
            <BlankStateContainer currentUser={fromJS(user)} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
