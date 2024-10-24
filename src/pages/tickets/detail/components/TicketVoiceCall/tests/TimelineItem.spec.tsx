import {render} from '@testing-library/react'
import React from 'react'

import TimelineItem from '../TimelineItem'

describe('TimelineItem', () => {
    it('renders children', () => {
        const {getByText} = render(<TimelineItem>Item 1</TimelineItem>)

        expect(getByText('Item 1')).toBeInTheDocument()
    })
})
