import type { ComponentProps, ContextType } from 'react'
import React from 'react'

import { render } from '@testing-library/react'

import { DropdownContext } from '../Dropdown'
import DropdownSection from '../DropdownSection'

const MockedComponent = (
    props: ComponentProps<typeof DropdownSection>,
    context: ContextType<typeof DropdownContext>,
) => {
    return (
        <DropdownContext.Provider value={context}>
            <DropdownSection {...props} />
        </DropdownContext.Provider>
    )
}

const defaultContext = {
    getHighlightedLabel: jest.fn(),
    onQueryChange: jest.fn(),
    isMultiple: false,
    onToggle: jest.fn(),
    query: '',
    value: '',
}

describe('<DropdownSection />', () => {
    it('should render', () => {
        const { container } = render(
            MockedComponent(
                { children: <div>Bar</div>, title: 'Foo' },
                defaultContext,
            ),
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not display when no children', () => {
        const { getByText } = render(
            MockedComponent({ children: null, title: 'Foo' }, defaultContext),
        )

        expect(
            getByText(/Foo/).parentElement?.className.includes('isHidden'),
        ).toBeTruthy()
    })

    it('should always display when alwaysRender is true even with no children', () => {
        const { getByText } = render(
            MockedComponent(
                { children: null, title: 'Foo', alwaysRender: true },
                defaultContext,
            ),
        )

        expect(
            getByText(/Foo/).parentElement?.className.includes('isHidden'),
        ).toBeFalsy()
    })

    it('should show border for sections with alwaysRender when previous sibling exists', () => {
        const { container } = render(
            <>
                {MockedComponent(
                    { children: null, title: 'First', alwaysRender: true },
                    defaultContext,
                )}
                {MockedComponent(
                    { children: null, title: 'Second', alwaysRender: true },
                    defaultContext,
                )}
            </>,
        )

        const sections = container.querySelectorAll('.wrapper')
        expect(sections[0].className.includes('hasBorder')).toBeFalsy()
        expect(sections[1].className.includes('hasBorder')).toBeTruthy()
    })
})
