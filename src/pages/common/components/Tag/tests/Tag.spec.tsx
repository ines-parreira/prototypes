import React from 'react'

import {fireEvent, render} from '@testing-library/react'

import Tag from '../Tag'

describe('<Tag />', () => {
    it('should not render leadIcon', () => {
        const {queryByTestId} = render(<Tag color="black" text="text" />)

        const leadIcon = queryByTestId('tag-lead-icon')

        expect(leadIcon).not.toBeInTheDocument()
    })

    it('should render leadIcon', () => {
        const {getByTestId} = render(
            <Tag color="black" leadIcon={<div>icon</div>} text="text" />
        )

        const leadIcon = getByTestId('tag-lead-icon')

        expect(leadIcon).toBeInTheDocument()
        expect(leadIcon).toHaveTextContent('icon')
    })

    it('should not render trailIcon', () => {
        const {queryByTestId} = render(<Tag color="black" text="text" />)

        const trailIcon = queryByTestId('tag-trail-icon')

        expect(trailIcon).not.toBeInTheDocument()
    })

    it('should render trailIcon', () => {
        const {getByTestId} = render(
            <Tag color="black" text="text" trailIcon={<div>icon</div>} />
        )

        const trailIcon = getByTestId('tag-trail-icon')

        expect(trailIcon).toBeInTheDocument()
        expect(trailIcon).toHaveTextContent('icon')
    })

    it('should not render text', () => {
        const {queryByTestId} = render(<Tag color="black" />)

        const text = queryByTestId('tag-text')

        expect(text).not.toBeInTheDocument()
    })

    it('should render text', () => {
        const {getByTestId} = render(<Tag color="black" text="text" />)

        const text = getByTestId('tag-text')

        expect(text).toBeInTheDocument()
        expect(text).toHaveTextContent('text')
    })

    it('should call onLeadIconClick', () => {
        const onLeadIconClick = jest.fn()

        const {getByTestId} = render(
            <Tag
                color="black"
                leadIcon={<div>icon</div>}
                onLeadIconClick={onLeadIconClick}
                text="text"
            />
        )

        const leadIcon = getByTestId('tag-lead-icon')

        fireEvent.click(leadIcon)

        expect(onLeadIconClick).toHaveBeenCalled()
    })

    it('should call onTrailIconClick', () => {
        const onTrailIconClick = jest.fn()

        const {getByTestId} = render(
            <Tag
                color="black"
                text="text"
                trailIcon={<div>icon</div>}
                onTrailIconClick={onTrailIconClick}
            />
        )

        const trailIcon = getByTestId('tag-trail-icon')

        fireEvent.click(trailIcon)

        expect(onTrailIconClick).toHaveBeenCalled()
    })
})
