import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import CollapsibleDetails from '../CollapsibleDetails'

const renderComponent = (title: JSX.Element, children: React.ReactNode) => {
    return render(
        <CollapsibleDetails title={title}>{children}</CollapsibleDetails>
    )
}

describe('CollapsibleDetails', () => {
    it('should only render title in initial state', () => {
        const title = <h1>Test Title</h1>
        const children = <p>Test Children</p>
        const {getByText, getByTestId, queryByText} = renderComponent(
            title,
            children
        )
        expect(getByTestId('collapsible-details-header')).toBeInTheDocument()
        expect(getByText('Test Title')).toBeInTheDocument()
        expect(queryByText('Test Children')).not.toBeInTheDocument()
    })

    it('should toggle the content when the header is clicked', () => {
        const title = <h1>Test Title</h1>
        const children = <p>Test Children</p>
        const {getByText, queryByText, getByTestId} = renderComponent(
            title,
            children
        )

        expect(getByText('keyboard_arrow_down')).toBeInTheDocument()
        expect(queryByText('Test Children')).not.toBeInTheDocument()

        fireEvent.click(getByTestId('collapsible-details-header'))
        expect(getByText('keyboard_arrow_up')).toBeInTheDocument()
        expect(getByText('Test Children')).toBeInTheDocument()

        fireEvent.click(getByTestId('collapsible-details-header'))
        expect(getByText('keyboard_arrow_down')).toBeInTheDocument()
        expect(queryByText('Test Children')).not.toBeInTheDocument()
    })
})
