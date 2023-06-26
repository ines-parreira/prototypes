import React from 'react'
import {render, screen} from '@testing-library/react'
import Card from '../Card'

describe('<Card />', () => {
    it('should render', () => {
        const {container} = render(<Card title="Test">Test</Card>)
        expect(container).toMatchSnapshot()
    })

    it('should render with link', () => {
        render(
            <Card
                title="Test"
                link={{url: 'https://gorgias.com', text: 'See Plans Details'}}
            >
                Test
            </Card>
        )
        // expect header to have link with text
        expect(screen.getByText('See Plans Details')).toHaveAttribute(
            'to',
            'https://gorgias.com'
        )
    })
})
