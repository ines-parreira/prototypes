import React from 'react'

import { render } from '@testing-library/react'
import userEvent, { TargetElement } from '@testing-library/user-event'

import { THEME_NAME, useTheme } from 'core/theme'

import BaseCard from '../BaseCard'

jest.mock('core/theme/useTheme.ts', () => jest.fn())
const useThemeMock = useTheme as jest.Mock

describe('<BaseCard />', () => {
    const props = {
        description: 'I can help you create something out of the box',
        title: 'The best template',
    }

    beforeEach(() => {
        useThemeMock.mockReturnValue({
            name: THEME_NAME.Classic,
            resolvedName: THEME_NAME.Classic,
        })
    })

    it('should display a base card', () => {
        const { getByText } = render(<BaseCard {...props} />)

        expect(getByText(props.description)).toBeInTheDocument()
        expect(getByText(props.title)).toBeInTheDocument()
    })

    it('should execute callback onClick', () => {
        const onClick = jest.fn()
        const { container } = render(<BaseCard {...props} onClick={onClick} />)

        userEvent.click(container.firstChild as TargetElement)
        expect(onClick).toHaveBeenCalled()
    })

    it('should display optional elements', () => {
        const options = {
            buttonLabel: 'button label',
            icon: 'custom icon',
            tag: 'custom tag',
            style: {
                background: '#ddd',
            },
        }
        const { container, getByText } = render(
            <BaseCard {...props} {...options} />,
        )

        expect(getByText(options.buttonLabel)).toBeInTheDocument()
        expect(getByText(new RegExp(options.icon, 'i'))).toBeInTheDocument()
        expect(getByText(new RegExp(options.tag, 'i'))).toBeInTheDocument()
        expect(container.firstChild).toHaveStyle(options.style)
    })

    it.each([
        ['non dark', THEME_NAME.Light, 'default'],
        ['dark', THEME_NAME.Dark, 'dark'],
    ])('should apply specific style for %s theme', (_, theme, className) => {
        useThemeMock.mockReturnValue({
            name: theme,
            resolvedName: theme,
        })
        const { container } = render(<BaseCard {...props} />)

        expect(container.firstChild).toHaveClass(className)
    })
})
