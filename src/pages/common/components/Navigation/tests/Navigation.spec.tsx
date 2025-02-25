import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Navigation from 'pages/common/components/Navigation/Navigation'

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
            !hasPrevItems,
        )}) and (next button disabled: ${String(!hasNextItems)})`, () => {
            const { container } = render(
                <Navigation
                    {...commonProps}
                    hasNextItems={hasNextItems}
                    hasPrevItems={hasPrevItems}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    it('should not render because there is no previous items nor next items', () => {
        const { container } = render(
            <Navigation
                {...commonProps}
                hasNextItems={false}
                hasPrevItems={false}
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch previous items when the previous button is clicked', () => {
        const prevSpy = jest.fn()
        render(<Navigation {...commonProps} fetchPrevItems={prevSpy} />)

        const prevButton = document.getElementById('prev-btn')
        prevButton && userEvent.click(prevButton)

        expect(prevSpy).toHaveBeenCalled()
    })

    it('should fetch next items when the next button is clicked', () => {
        const nextSpy = jest.fn()
        render(<Navigation {...commonProps} fetchNextItems={nextSpy} />)

        const nextButton = document.getElementById('next-btn')
        nextButton && userEvent.click(nextButton)

        expect(nextSpy).toHaveBeenCalled()
    })
})
