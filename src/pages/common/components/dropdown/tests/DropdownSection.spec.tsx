import {render} from '@testing-library/react'
import React, {ComponentProps, ContextType} from 'react'

import {DropdownContext} from '../Dropdown'
import DropdownSection from '../DropdownSection'

const MockedComponent = (
    props: ComponentProps<typeof DropdownSection>,
    context: ContextType<typeof DropdownContext>
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
        const {container} = render(
            MockedComponent(
                {children: <div>Bar</div>, title: 'Foo'},
                defaultContext
            )
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not display when no children', () => {
        const {getByText} = render(
            MockedComponent({children: null, title: 'Foo'}, defaultContext)
        )

        expect(
            getByText(/Foo/).parentElement?.className.includes('isHidden')
        ).toBeTruthy()
    })
})
