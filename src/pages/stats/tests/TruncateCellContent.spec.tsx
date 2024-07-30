import React, {ComponentProps} from 'react'
import {render, screen} from '@testing-library/react'

import {TruncateCellContent} from 'pages/stats/TruncateCellContent'

jest.mock('react', () => {
    return {
        ...jest.requireActual<typeof React>('react'),
        useRef: jest.fn().mockReturnValue({current: null}),
    }
})

describe('<TruncateCellContent />', () => {
    const content = 'Test Category'
    const longContent = 'Long content with long text name'
    const minProps: ComponentProps<typeof TruncateCellContent> = {
        content,
    }

    afterAll(() => {
        jest.resetAllMocks()
    })

    it('should render the truncated content from the left', () => {
        render(<TruncateCellContent {...minProps} />)

        expect(screen.getByText(content)).toBeInTheDocument()
        expect(document.querySelector('.text')).not.toHaveClass('truncate')
    })

    it('should render truncated text from the right when adding isRTL', () => {
        jest.spyOn(React, 'useRef').mockReturnValue({
            get current() {
                return {offsetWidth: 1, scrollWidth: 2}
            },

            set current(_value) {
                // empty function
            },
        })

        render(<TruncateCellContent content={longContent} left />)

        expect(document.querySelector('.text')).toHaveClass('truncate')
    })

    it('should not truncate the text when offsetWidth is smaller than scrollWidth', () => {
        jest.spyOn(React, 'useRef').mockReturnValue({
            get current() {
                return {offsetWidth: 2, scrollWidth: 1}
            },
            set current(_value) {
                // empty function
            },
        })

        render(<TruncateCellContent content={longContent} />)

        expect(document.querySelector('.text')).not.toHaveClass('truncate')
    })
})
