import {render} from '@testing-library/react'
import React from 'react'

import ExpandAllButton from '../ExpandAllButton'

describe('<ExpandAllButton/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const {container} = render(<ExpandAllButton />)

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
