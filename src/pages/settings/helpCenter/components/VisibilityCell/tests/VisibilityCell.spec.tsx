import React from 'react'
import {render} from '@testing-library/react'

import {VisibilityStatus} from 'models/helpCenter/types'
import VisibilityCell from '../VisibilityCell'

describe('<VisibilityCell />', () => {
    it('should match snapshot', () => {
        const statusArray: VisibilityStatus[] = ['PUBLIC', 'UNLISTED']
        statusArray.forEach((status) => {
            const {container} = render(<VisibilityCell status={status} />)
            expect(container).toMatchSnapshot()
        })
    })
})
