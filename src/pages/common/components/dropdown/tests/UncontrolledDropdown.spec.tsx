import {fireEvent, render} from '@testing-library/react'
import React, {ComponentProps, useRef} from 'react'

import UncontrolledDropdown from '../UncontrolledDropdown'

function MockedImplementation(
    props: Partial<ComponentProps<typeof UncontrolledDropdown>>
) {
    const targetRef = useRef<HTMLDivElement>(null)

    return (
        <>
            <div ref={targetRef}>Foo</div>
            <UncontrolledDropdown target={targetRef} {...props} />
        </>
    )
}

describe('<UncontrolledDropdown />', () => {
    it('should render a closed dropdown', () => {
        const {container} = render(
            <MockedImplementation>Bar</MockedImplementation>
        )

        expect(container.parentElement).toMatchSnapshot()
    })

    it('should open the dropdown when clicking the target', () => {
        const {container, getByText} = render(
            <MockedImplementation>Bar</MockedImplementation>
        )

        fireEvent.click(getByText(/Foo/))
        expect(container.parentElement).toMatchSnapshot()
    })
})
