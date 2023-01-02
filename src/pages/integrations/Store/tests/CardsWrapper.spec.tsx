import React from 'react'
import {render} from '@testing-library/react'

import CardsWrapper from '../CardsWrapper'

describe('<Category />', () => {
    it('should render correctly with a header', () => {
        const {container} = render(
            <CardsWrapper header={<h2>Mighty</h2>}>
                <li>Card 1</li>
                <li>Card 2</li>
            </CardsWrapper>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
