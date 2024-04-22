import React from 'react'
import {render} from '@testing-library/react'
import userEvent, {TargetElement} from '@testing-library/user-event'

import {AcceptedThemes, ThemeContext, useThemeContext} from 'theme'

import BaseCard from '../BaseCard'

describe('<BaseCard />', () => {
    const props = {
        description: 'I can help you create something out of the box',
        title: 'The best template',
    }

    it('should display a base card', () => {
        const {getByText} = render(<BaseCard {...props} />)

        expect(getByText(props.description)).toBeInTheDocument()
        expect(getByText(props.title)).toBeInTheDocument()
    })

    it('should execute callback onClick', () => {
        const onClick = jest.fn()
        const {container} = render(<BaseCard {...props} onClick={onClick} />)

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
        const {container, getByText} = render(
            <BaseCard {...props} {...options} />
        )

        expect(getByText(options.buttonLabel)).toBeInTheDocument()
        expect(getByText(new RegExp(options.icon, 'i'))).toBeInTheDocument()
        expect(getByText(new RegExp(options.tag, 'i'))).toBeInTheDocument()
        expect(container.firstChild).toHaveStyle(options.style)
    })

    it.each([
        ['non dark', 'default'],
        ['dark', 'dark'],
    ])('should apply specific style for %s theme', (theme, className) => {
        const {container} = render(
            <ThemeContext.Provider
                value={
                    {
                        theme: theme as AcceptedThemes,
                    } as unknown as ReturnType<typeof useThemeContext>
                }
            >
                <BaseCard {...props} />
            </ThemeContext.Provider>
        )

        expect(container.firstChild).toHaveClass(className)
    })
})
