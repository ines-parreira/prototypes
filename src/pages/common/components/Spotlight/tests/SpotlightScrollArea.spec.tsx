import React from 'react'
import {render} from '@testing-library/react'

import SpotlightScrollArea from '../SpotlightScrollArea'

describe('<SpotlightScrollArea/>', () => {
    it('should render', () => {
        const {container} = render(
            <SpotlightScrollArea>foo</SpotlightScrollArea>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
