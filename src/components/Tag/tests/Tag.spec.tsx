import { fireEvent, render, screen } from '@testing-library/react'

import { THEME_NAME, themeTokenMap, useTheme } from 'core/theme'
import { assumeMock } from 'utils/testing'

import { Tag } from '../Tag'

jest.mock('core/theme/useTheme.ts', () => jest.fn())
const useThemeMock = assumeMock(useTheme)

describe('<Tag />', () => {
    beforeEach(() => {
        useThemeMock.mockReturnValue({
            name: THEME_NAME.Light,
            resolvedName: THEME_NAME.Light,
            tokens: themeTokenMap[THEME_NAME.Light],
        })
    })

    it('should render', () => {
        const text = 'text'
        const color = '#123456' // hsl(210, 65%, 20%)
        render(<Tag color={color} text={text} />)

        const tag = screen.getByText(text)

        expect(tag).toBeInTheDocument()
        expect(tag).toHaveStyle(`--tag-dot-color: ${color}`)
    })

    it('should not render trailIcon', () => {
        render(<Tag color="black" text="text" />)

        const leadIcon = document.querySelector('.icon')
        expect(leadIcon).toBeNull()
    })

    it('should render trailIcon', () => {
        render(
            <Tag color="black" text="text" trailIcon={<div>trailIcon</div>} />,
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
            />,
        )

        fireEvent.click(screen.getByText(trailIcon))
        expect(onTrailIconClick).toHaveBeenCalled()
    })

    it('should use the correct default color based on theme', () => {
        const text = 'text'
        render(<Tag text={text} />)

        const tag = screen.getByText(text)
        expect(tag).toHaveStyle('--tag-dot-color: #6a6a6a;')
    })

    it('should use system theme default color when theme is system', () => {
        useThemeMock.mockReturnValue({
            name: 'system',
            resolvedName: THEME_NAME.Light,
            tokens: themeTokenMap[THEME_NAME.Light],
        })

        const text = 'text'
        render(<Tag text={text} />)

        const tag = screen.getByText(text)
        expect(tag).toHaveStyle('--tag-dot-color: #556885;')
    })
})
