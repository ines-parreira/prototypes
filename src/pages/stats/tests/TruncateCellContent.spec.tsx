import React, {ComponentProps} from 'react'
import {render, screen} from '@testing-library/react'

import {TruncateCellContent} from '../TruncateCellContent'

jest.mock('react', () => {
    return {
        ...jest.requireActual<typeof React>('react'),
        useRef: jest.fn().mockReturnValue({current: null}),
    }
})

describe('<TruncateCellContent />', () => {
    const content = 'Test Category'
    const minProps: ComponentProps<typeof TruncateCellContent> = {
        content,
    }

    afterAll(() => {
        jest.resetAllMocks()
    })

    it('should render the content', () => {
        render(<TruncateCellContent {...minProps} />)

        expect(screen.getByText(content)).toBeInTheDocument()
    })

    it('should render truncated text from the right', () => {
        jest.spyOn(React, 'useRef').mockReturnValue({
            get current() {
                return {offsetWidth: 1, scrollWidth: 2}
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            set current(_value) {},
        })

        render(
            <TruncateCellContent content="Long content with long text name" />
        )

        expect(document.querySelector('.text')).toHaveClass('truncate')
    })
})
