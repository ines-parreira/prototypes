import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'

import Tag from '../Tag'

describe('<Tag />', () => {
    it('should not render leadIcon', () => {
        render(<Tag color="black" text="text" />)

        const leadIcon = document.querySelector('.icon')
        expect(leadIcon).toBeNull()
    })

    it('should render leadIcon', () => {
        render(<Tag color="black" leadIcon={<div>leadIcon</div>} text="text" />)
        expect(screen.getByText('leadIcon')).toBeInTheDocument()
    })

    it('should not render trailIcon', () => {
        render(<Tag color="black" text="text" />)

        const leadIcon = document.querySelector('.icon')
        expect(leadIcon).toBeNull()
    })

    it('should render trailIcon', () => {
        render(
            <Tag color="black" text="text" trailIcon={<div>trailIcon</div>} />
        )

        expect(screen.getByText('trailIcon')).toBeInTheDocument()
    })

    it('should not render text', () => {
        render(<Tag color="black" />)

        const text = document.querySelector('.text')
        expect(text).not.toBeInTheDocument()
    })

    it('should render text', () => {
        render(<Tag color="black" text="tagText" />)

        expect(screen.getByText('tagText')).toBeInTheDocument()
    })

    it('should call onLeadIconClick', () => {
        const leadIcon = 'leadIcon'
        const onLeadIconClick = jest.fn()
        render(
            <Tag
                color="black"
                leadIcon={<div>{leadIcon}</div>}
                onLeadIconClick={onLeadIconClick}
                text="text"
            />
        )

        fireEvent.click(screen.getByText(leadIcon))
        expect(onLeadIconClick).toHaveBeenCalled()
    })

    it('should call onTrailIconClick', () => {
        const onTrailIconClick = jest.fn()
        const trailIcon = 'trailIcon'

        render(
            <Tag
                color="black"
                text="text"
                trailIcon={<div>{trailIcon}</div>}
                onTrailIconClick={onTrailIconClick}
            />
        )

        fireEvent.click(screen.getByText(trailIcon))
        expect(onTrailIconClick).toHaveBeenCalled()
    })
})
