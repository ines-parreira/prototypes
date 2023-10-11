import {render} from '@testing-library/react'
import React from 'react'

import {CardHeaderIcon} from '../CardHeaderIcon'

describe('<CardHeaderIcon/>', () => {
    describe('render()', () => {
        it('should render icon', () => {
            const {container} = render(
                <CardHeaderIcon alt="Foo" src="foo.png" />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render icon with color as background-image', () => {
            const {container} = render(
                <CardHeaderIcon alt="Foo" src="foo.png" color="#123" />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
