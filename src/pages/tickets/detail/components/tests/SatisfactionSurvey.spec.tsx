import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {getLDClient} from 'utils/launchDarkly'
import {FeatureFlagKey} from 'config/featureFlags'

import SatisfactionSurvey from '../SatisfactionSurvey'

jest.mock('utils/launchDarkly')
const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({
    [FeatureFlagKey.TicketMessagesVirtualization]: true,
})

describe('SatisfactionSurvey', () => {
    it('should display satisfaction survey', () => {
        const component = shallow(
            <SatisfactionSurvey
                satisfactionSurvey={fromJS({
                    body_text: 'test',
                    score: 3,
                    scored_datetime: 'now',
                })}
                customer={fromJS({
                    name: 'test me',
                })}
                isLast
            />
        )

        expect(component).toMatchSnapshot()
    })
})
