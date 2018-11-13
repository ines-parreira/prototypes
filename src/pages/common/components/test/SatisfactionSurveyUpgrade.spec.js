import React from 'react'
import {shallow} from 'enzyme'
import SatisfactionSurveyUpgrade from '../SatisfactionSurveyUpgrade'

describe('SatisfactionSurveyUpgrade component', () => {
    it('should render image carusel and Lightbox', () => {
        const component = shallow(
            <SatisfactionSurveyUpgrade />
        )

        expect(component).toMatchSnapshot()
    })
})
