import React from 'react'
import {render} from '@testing-library/react'

import LegacyTag from '../LegacyTag'

describe('<LegacyTag />', () => {
    it('should render a legacy tag', () => {
        const {container} = render(
            <LegacyTag label="Legacy Tag" labelIcon="warning" />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
