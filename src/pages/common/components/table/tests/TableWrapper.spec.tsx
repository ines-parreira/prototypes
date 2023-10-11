import {render} from '@testing-library/react'
import React from 'react'

import TableWrapper from '../TableWrapper'

describe('<TableWrapper/>', () => {
    it('should render', () => {
        const {container} = render(
            <TableWrapper className="foo">Bar</TableWrapper>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
