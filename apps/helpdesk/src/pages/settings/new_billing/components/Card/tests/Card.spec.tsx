import { render, screen } from '@testing-library/react'

import Card from '../Card'

describe('<Card />', () => {
    it('should render', () => {
        const { container } = render(<Card title="Test">Test</Card>)
        expect(container).toMatchSnapshot()
    })

    it('should render with link', () => {
        render(
            <Card
                title="Test"
                link={{ url: 'https://gorgias.com', text: 'See Plans Details' }}
            >
                Test
            </Card>,
        )
        // expect header to have link with text
        expect(screen.getByText('See Plans Details')).toHaveAttribute(
            'href',
            'https://gorgias.com',
        )
    })

    it('should call onClick when link is clicked', () => {
        const onClick = jest.fn()

        render(
            <Card
                title="Test"
                link={{
                    url: 'https://gorgias.com',
                    text: 'See Plans Details',
                    onClick,
                }}
            >
                Test
            </Card>,
        )

        const link = screen.getByText('See Plans Details')
        link.click()

        expect(onClick).toHaveBeenCalledTimes(1)
    })
})
