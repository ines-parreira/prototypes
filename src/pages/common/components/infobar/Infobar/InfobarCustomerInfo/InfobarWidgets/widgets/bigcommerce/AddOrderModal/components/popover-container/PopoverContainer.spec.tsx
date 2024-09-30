import React, {ComponentProps, PropsWithChildren, useRef} from 'react'

import {fireEvent, render, screen} from '@testing-library/react'
import {PopoverContainer} from './PopoverContainer'

// We don't care about internals of `Dropdown`, just want to render out the children that we pass
jest.mock('pages/common/components/dropdown/Dropdown', () => ({
    __esModule: true,
    default: ({children}: PropsWithChildren<unknown>) => <>{children}</>,
}))

const WrapperComponent = (
    props: Partial<ComponentProps<typeof PopoverContainer>>
) => {
    const mockReference = useRef<HTMLButtonElement>(null)

    return (
        <PopoverContainer
            isOpen={true}
            onToggle={jest.fn()}
            target={mockReference}
            body={
                <div>
                    <span>A Body</span>
                </div>
            }
            footer={
                <div>
                    <footer>A footer</footer>
                </div>
            }
            {...props}
        />
    )
}

describe('<PopoverContainer />', () => {
    it('renders', () => {
        const {container} = render(<WrapperComponent />)

        expect(container).toMatchSnapshot()
    })

    it('calls `onToggle` on "Escape" key press', function () {
        const onToggleMock = jest.fn()
        render(<WrapperComponent onToggle={onToggleMock} />)

        fireEvent.keyDown(screen.getByText('A Body'), {
            key: 'Escape',
        })
        expect(onToggleMock).toHaveBeenCalled()
    })
})
