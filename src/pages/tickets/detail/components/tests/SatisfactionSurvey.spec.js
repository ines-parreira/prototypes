import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import SatisfactionSurvey from '../SatisfactionSurvey'

describe('SatisfactionSurvey', () => {
    it('should display satisfaction survey', () => {
        const component = shallow(
            <SatisfactionSurvey
                satisfactionSurvey={fromJS({
                    body_text: 'test',
                    score: 3,
                    scored_datetime: 'now'
                })}
                customer={fromJS({
                    name: 'test me'
                })}
                timezone={'UTC'}
                isLast
            />
        )

        expect(component).toMatchSnapshot()
    })
})
