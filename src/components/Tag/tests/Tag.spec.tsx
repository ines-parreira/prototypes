import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'

import Tag from '../Tag'

jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

const mockFlagSet = {
    [FeatureFlagKey.TagNewDesign]: false,
}

jest.mock('utils/launchDarkly')

describe('<Tag />', () => {
    beforeEach(() => {
        mockUseFlag.mockImplementation(
            (featureFlag: keyof typeof mockFlagSet) => {
                return mockFlagSet[featureFlag]
            }
        )
    })

    it('should not render leadIcon', () => {
        render(<Tag color="black" text="text" />)

        const leadIcon = document.querySelector('.icon')
        expect(leadIcon).toBeNull()
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

    it('should render new design', () => {
        mockUseFlag.mockReturnValue(true)
        const text = 'myTag'
        const color = 'teal'
        const customColor = '#456123'

        const {container} = render(
            <Tag color={color} text={text} customColor={customColor} />
        )

        expect(container.firstChild).toHaveClass('newTag')
        expect(screen.getByText(text)).toHaveClass('newText')
        expect(screen.getByText(text)).toHaveClass(color)
        expect(screen.getByText(text)).toHaveStyle(
            `--tag-dot-color: ${customColor}`
        )
    })
})
