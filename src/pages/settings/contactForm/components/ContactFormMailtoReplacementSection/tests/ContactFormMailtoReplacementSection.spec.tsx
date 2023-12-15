import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactFormMailtoReplacementSection from '../ContactFormMailtoReplacementSection'

const renderComponent = () => {
    render(<ContactFormMailtoReplacementSection />)
}
describe('<ContactFormMailtoReplacementSection />', () => {
    it('should render component', () => {
        renderComponent()

        expect(screen.getByText('Replace email links')).toBeInTheDocument()
    })

    it('should hide alert after we close it', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Pages with iFrames, tables, or dynamic content may require manual replacement.'
            )
        ).toBeInTheDocument()

        userEvent.click(screen.getByLabelText('Close Icon'))

        expect(
            screen.queryByText(
                'Pages with iFrames, tables, or dynamic content may require manual replacement.'
            )
        ).not.toBeInTheDocument()
    })
})
