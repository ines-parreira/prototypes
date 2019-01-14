import React from 'react'
import RestrictedSatisfactionSurvey from '../RestrictedSatisfactionSurvey'
import {shallow} from 'enzyme'


describe('RestrictedSatisfactionSurvey', () => {
    it('should render', () => {
        const component = shallow(<RestrictedSatisfactionSurvey />)
        expect(component).toMatchSnapshot()
    })
})
