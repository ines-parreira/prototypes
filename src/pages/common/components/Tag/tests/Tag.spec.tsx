import React from 'react'

import {fireEvent, render} from '@testing-library/react'

import useElementSize from 'hooks/useElementSize'
import Tag from '../Tag'

jest.mock('react', () => {
    return {
        ...jest.requireActual<typeof React>('react'),
        useRef: jest.fn().mockReturnValue({current: null}),
    }
})

jest.mock('hooks/useElementSize')
const useElementSizeMock = jest.mocked(useElementSize)
useElementSizeMock.mockReturnValue([100, 20])

const setSpyOnUseRef = (offsetWidth: number, scrollWidth: number) => {
    jest.spyOn(React, 'useRef').mockReturnValue({
        get current() {
            return {offsetWidth, scrollWidth}
        },
        set current(_value) {},
    })
}

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

    it('should call onEllipsisChange with "true" if there is an ellipsis', () => {
        const onEllipsisChange = jest.fn()
        setSpyOnUseRef(50, 100)

        render(<Tag text="text" onEllipsisChange={onEllipsisChange} />)

        expect(onEllipsisChange).toHaveBeenCalledTimes(1)
        expect(onEllipsisChange).toHaveBeenCalledWith(true)
    })

    it('should call onEllipsisChange with "false" if there is no ellipsis', () => {
        const onEllipsisChange = jest.fn()
        setSpyOnUseRef(50, 50)

        render(<Tag text="text" onEllipsisChange={onEllipsisChange} />)

        expect(onEllipsisChange).toHaveBeenCalledTimes(1)
        expect(onEllipsisChange).toHaveBeenCalledWith(false)
    })
})
