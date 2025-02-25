import React from 'react'

import { render } from '@testing-library/react'

import Timeline from '../Timeline'
import TimelineItem from '../TimelineItem'

jest.mock('../TimelineItem', () => ({ children }: { children: any }) => (
    <div>{children}</div>
))

describe('Timeline', () => {
    it('renders children', () => {
        const { getByText } = render(
            <Timeline>
                <TimelineItem>Item 1</TimelineItem>
                <TimelineItem>Item 2</TimelineItem>
            </Timeline>,
        )

        expect(getByText('Item 1')).toBeInTheDocument()
        expect(getByText('Item 2')).toBeInTheDocument()
    })
})
