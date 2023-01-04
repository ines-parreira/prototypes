import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import HeaderWithInfo from '../HeaderWithInfo'

describe('<HeaderWithInfo />', () => {
    it('should render the title', () => {
        const {container} = render(
            <HeaderWithInfo
                title="Foo"
                description="Foo statistic page"
                helpUrl="http://example.com"
            />
        )
        expect(container).toMatchSnapshot()
    })

    it('should render the description on learn button click', async () => {
        const {getByText, findByTestId} = render(
            <HeaderWithInfo
                title="Foo"
                description={<span data-testid="description">description</span>}
                helpUrl="http://example.com"
            />
        )

        fireEvent.click(getByText('Learn'))

        await findByTestId('description')
    })

    it('should not render the learn more link when missing helpUrl', () => {
        const {getByText, queryByText} = render(
            <HeaderWithInfo
                title="Foo"
                description={<span data-testid="description">description</span>}
            />
        )
        fireEvent.click(getByText('Learn'))

        expect(queryByText('Learn More')).toBeNull()
    })

    it('should not render the learn more button when missing description', () => {
        const {queryByText} = render(<HeaderWithInfo title="Foo" />)

        expect(queryByText('Learn')).toBeNull()
    })
})
