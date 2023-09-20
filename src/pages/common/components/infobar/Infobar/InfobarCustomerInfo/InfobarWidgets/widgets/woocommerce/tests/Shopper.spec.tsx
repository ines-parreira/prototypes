import React from 'react'
import {render} from '@testing-library/react'

import {TitleWrapper} from '../Shopper'

describe('Shopper card', () => {
    describe('<TitleWrapper/>', () => {
        it('should render it children, plus woocommerce logo and title', () => {
            const {container} = render(<TitleWrapper>Shopper</TitleWrapper>)

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
