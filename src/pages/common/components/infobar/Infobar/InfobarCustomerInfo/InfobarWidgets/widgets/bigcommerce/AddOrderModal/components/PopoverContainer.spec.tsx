import React, {PropsWithChildren, useRef} from 'react'

import {render} from '@testing-library/react'
import {PopoverContainer} from './PopoverContainer'

// We don't care about internals of `Dropdown`, just want to render out the children that we pass
jest.mock('pages/common/components/dropdown/Dropdown', () => ({
    __esModule: true,
    default: ({children}: PropsWithChildren<unknown>) => <>{children}</>,
}))

const WrapperComponent = () => {
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
        />
    )
}

describe('<PopoverContainer />', () => {
    it('renders', () => {
        const {container} = render(<WrapperComponent />)

        expect(container).toMatchSnapshot()
    })
})
