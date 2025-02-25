import React from 'react'

import { render, screen } from '@testing-library/react'

import StaticField from '../StaticField'

describe('<StaticField/>', () => {
    const defaultProps = {
        label: 'Label',
        children: 'Value',
    }

    describe('render()', () => {
        it('should render with label', () => {
            render(<StaticField {...defaultProps} />)

            expect(screen.getByText(`${defaultProps.label}:`))
            expect(screen.getByText(defaultProps.children))
        })

        it('should render without label', () => {
            render(<StaticField {...defaultProps} label={undefined} />)

            expect(screen.queryByText(`${defaultProps.label}:`)).toBeNull()
            expect(screen.getByText(defaultProps.children))
        })

        it('should not add `isDisabled` class when `isDisabled` prop is not true', () => {
            render(<StaticField {...defaultProps} />)

            expect(
                screen
                    .getByText(`${defaultProps.label}:`)
                    .classList.contains('isDisabled'),
            ).toBeFalsy()
            expect(
                screen
                    .getByText(defaultProps.children)
                    .classList.contains('isDisabled'),
            ).toBeFalsy()
        })

        it('should add `isDisabled` class when `isDisabled` prop is true', () => {
            render(<StaticField {...defaultProps} isDisabled isNotBold />)

            expect(
                screen
                    .getByText(`${defaultProps.label}:`)
                    .classList.contains('isDisabled'),
            ).toBeTruthy()
            expect(
                screen
                    .getByText(defaultProps.children)
                    .classList.contains('isDisabled'),
            ).toBeTruthy()
        })

        it('should not add `isNotBold` class when `isNotBold` prop is not true', () => {
            render(<StaticField {...defaultProps} />)

            expect(
                screen
                    .getByText(defaultProps.children)
                    .classList.contains('isNotBold'),
            ).toBeFalsy()
        })

        it('should add `isNotBold` class when `isNotBold` prop is true', () => {
            render(<StaticField {...defaultProps} isNotBold />)

            expect(
                screen
                    .getByText(defaultProps.children)
                    .classList.contains('isNotBold'),
            ).toBeTruthy()
        })
    })
})
