import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'

import Navigation from '../Navigation'

const commonProps: ComponentProps<typeof Navigation> = {
    hasNextItems: true,
    hasPrevItems: true,
    fetchNextItems: () => null,
    fetchPrevItems: () => null,
}

describe('Navigation component', () => {
    ;[
        [true, true],
        [true, false],
        [false, true],
    ].forEach(([hasNextItems, hasPrevItems]) => {
        it(`should render with (prev button disabled: ${String(
            !hasPrevItems
        )}) and (next button disabled: ${String(!hasNextItems)})`, () => {
            const component = shallow(
                <Navigation
                    {...commonProps}
                    hasNextItems={hasNextItems}
                    hasPrevItems={hasPrevItems}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    it('should not render because there is no previous items nor next items', () => {
        const component = shallow(
            <Navigation
                {...commonProps}
                hasNextItems={false}
                hasPrevItems={false}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should fetch previous items when the previous button is clicked', () => {
        const prevSpy = jest.fn()
        const component = shallow(
            <Navigation {...commonProps} fetchPrevItems={prevSpy} />
        )

        component.find('#prev-btn').simulate('click')
        expect(prevSpy).toHaveBeenCalledWith()
    })

    it('should fetch next items when the next button is clicked', () => {
        const nextSpy = jest.fn()
        const component = shallow(
            <Navigation {...commonProps} fetchNextItems={nextSpy} />
        )

        component.find('#next-btn').simulate('click')
        expect(nextSpy).toHaveBeenCalledWith()
    })
})
