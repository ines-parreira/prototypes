import React from 'react'

import { render } from '@testing-library/react'

import RestrictedFeature from '../RestrictedFeature'

describe('RestrictedFeature component', () => {
    it('should render image carousel and Lightbox', () => {
        const { container } = render(
            <RestrictedFeature
                imagesURL={['url1', 'url2']}
                info="text"
                alertMsg={
                    <>This feature is only available for Pro and above plans.</>
                }
            />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render alert with a link and an action', () => {
        const { container } = render(
            <RestrictedFeature
                imagesURL={['url1', 'url2']}
                info="text"
                actionHref="/app/settings/billing/plans"
                actionLabel="Upgrade here."
                alertMsg={
                    <>This feature is only available for Pro and above plans.</>
                }
            />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
