import React from 'react'

import { render } from '@testing-library/react'

import TimelineItem from 'pages/tickets/detail/components/TicketVoiceCall/TimelineItem'

import Timeline from '../Timeline'

jest.mock('../TimelineItem', () => ({ children }: { children: any }) => (
    <div>{children}</div>
))

describe('Timeline', () => {
    it('should render children', () => {
        const { getByText } = render(
            <Timeline>
                <TimelineItem>Item 1</TimelineItem>
                <TimelineItem>Item 2</TimelineItem>
            </Timeline>,
        )

        expect(getByText('Item 1')).toBeInTheDocument()
        expect(getByText('Item 2')).toBeInTheDocument()
    })

    it('should apply container class by default', () => {
        const { container } = render(
            <Timeline>
                <TimelineItem>Item 1</TimelineItem>
                <TimelineItem>Item 2</TimelineItem>
            </Timeline>,
        )

        const timelineElement = container.firstChild
        expect(timelineElement).toHaveClass('container')
        expect(timelineElement).not.toHaveClass('fullWidth')
    })

    it('should apply fullWidth class when useFullWidth is true', () => {
        const { container } = render(
            <Timeline useFullWidth>
                <TimelineItem>Item 1</TimelineItem>
                <TimelineItem>Item 2</TimelineItem>
            </Timeline>,
        )

        const timelineElement = container.firstChild
        expect(timelineElement).toHaveClass('container')
        expect(timelineElement).toHaveClass('fullWidth')
    })
})
