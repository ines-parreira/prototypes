import React from 'react'
import {shallow} from 'enzyme'

import RestrictedFeature from '../RestrictedFeature'

describe('RestrictedFeature component', () => {
    it('should render image carousel and Lightbox', () => {
        const component = shallow(
            <RestrictedFeature
                imagesURL={['url1', 'url2']}
                info="text"
                alertMsg={
                    <>This feature is only available for Pro and above plans.</>
                }
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render alert with a link and an action', () => {
        const component = shallow(
            <RestrictedFeature
                imagesURL={['url1', 'url2']}
                info="text"
                actionHref="/app/settings/billing/plans"
                actionLabel="Upgrade here."
                alertMsg={
                    <>This feature is only available for Pro and above plans.</>
                }
            />
        )
        expect(component).toMatchSnapshot()
    })
})
