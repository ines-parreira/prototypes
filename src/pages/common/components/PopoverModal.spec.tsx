import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import PopoverModal from './PopoverModal'

describe('<PopoverModal />', () => {
    it('should render ', () => {
        const {container} = render(<PopoverModal>Foo</PopoverModal>)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the popover modal on click', async () => {
        const {getByText, findByText} = render(<PopoverModal>Foo</PopoverModal>)
        fireEvent.click(getByText(/Learn/i))

        const element = await findByText(/Foo/i)
        expect(element.parentElement?.parentElement).toMatchSnapshot()
    })
})
