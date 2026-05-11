import { render } from '@repo/testing'

import { StepCardIcon } from '../StepCardIcon'

describe('StepCardIcon', () => {
    it('should render with correct icon', () => {
        const { container } = render(
            <StepCardIcon backgroundColor="blue" name="phone" />,
        )

        const iconElement = container.querySelector('[aria-label="phone"]')
        expect(iconElement).toBeInTheDocument()
    })

    it('should apply correct background color class', () => {
        const { container } = render(
            <StepCardIcon backgroundColor="purple" name="settings" />,
        )

        const iconWrapper = container.firstChild as HTMLElement
        expect(iconWrapper).toHaveClass('icon')
        expect(iconWrapper).toHaveClass('purple')
    })

    describe('background colors', () => {
        const colors = [
            'blue',
            'coral',
            'fuchsia',
            'purple',
            'orange',
            'green',
            'yellow',
            'teal',
        ] as const

        colors.forEach((color) => {
            it(`should apply ${color} background color class`, () => {
                const { container } = render(
                    <StepCardIcon backgroundColor={color} name="check" />,
                )

                const iconWrapper = container.firstChild as HTMLElement
                expect(iconWrapper).toHaveClass(color)
            })
        })
    })
})
