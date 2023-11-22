import React from 'react'
import {fromJS} from 'immutable'

import {render} from '@testing-library/react'
import SatisfactionSurvey from '../SatisfactionSurvey'

jest.mock('pages/common/utils/labels', () => ({
    DatetimeLabel: () => null,
}))

describe('SatisfactionSurvey', () => {
    it('should display satisfaction survey', () => {
        const {container} = render(
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

        expect(container.firstChild).toMatchSnapshot()
    })
})
