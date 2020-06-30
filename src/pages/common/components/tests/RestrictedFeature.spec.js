import React from 'react'
import {Link} from 'react-router'
import {shallow} from 'enzyme'

import RestrictedFeature from '../RestrictedFeature'

describe('RestrictedFeature component', () => {
    it('should render image carusel and Lightbox', () => {
        const component = shallow(
            <RestrictedFeature
                imagesURL={['url1', 'url2']}
                info="text"
                alertMsg={
                    <>
                        This feature is only available for Pro and above plans.
                        <Link to="/app/settings/billing/plans">
                            {' '}
                            Upgrade here.
                        </Link>
                    </>
                }
            />
        )
        expect(component).toMatchSnapshot()
    })
})
