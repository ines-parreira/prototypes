import React from 'react'
import {shallow} from 'enzyme'

import RestrictedFeature from '../RestrictedFeature'

describe('RestrictedFeature component', () => {
    it('should render image carusel and Lightbox', () => {
        const component = shallow(
            <RestrictedFeature
                imagesURL={['url1', 'url2']}
                info="text"
            />
        )
        expect(component).toMatchSnapshot()
    })
})
