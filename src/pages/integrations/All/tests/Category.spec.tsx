import React from 'react'
import {render} from '@testing-library/react'

import Category from '../Category'

describe('<Category />', () => {
    it('should render correctly', () => {
        const {container} = render(
            <Category
                title={
                    <>
                        My <b>Title</b>
                    </>
                }
                subtitle="My subtitle"
            >
                My category content
            </Category>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
