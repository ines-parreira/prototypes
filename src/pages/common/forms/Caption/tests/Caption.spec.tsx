import React from 'react'
import {render} from '@testing-library/react'

import Caption from '../Caption'

describe('<Caption />', () => {
    it('should render a caption', () => {
        const {container} = render(<Caption>I am a caption</Caption>)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the error instead of the caption', () => {
        const {container} = render(
            <Caption error="This field cannot be empty">I am a caption</Caption>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
