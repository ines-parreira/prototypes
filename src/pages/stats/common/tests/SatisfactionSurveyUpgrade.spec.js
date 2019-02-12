import React from 'react'
import {shallow} from 'enzyme'

import RestrictedSatisfactionSurvey from '../RestrictedSatisfactionSurvey'


describe('RestrictedSatisfactionSurvey', () => {
    it('should render', () => {
        const component = shallow(<RestrictedSatisfactionSurvey />)
        expect(component).toMatchSnapshot()
    })
})
