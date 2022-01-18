import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import StatsPageTitle from '../StatsPageTitle'

describe('StatsPageTitle', () => {
    it('should render the title', () => {
        const {container} = render(
            <StatsPageTitle
                title="Foo"
                description="Foo statistic page"
                helpUrl="http://example.com"
            />
        )
        expect(container).toMatchSnapshot()
    })

    it('should render the description on learn button click', async () => {
        const {getByText, findByTestId} = render(
            <StatsPageTitle
                title="Foo"
                description={<span data-testid="description">description</span>}
                helpUrl="http://example.com"
            />
        )

        fireEvent.click(getByText('Learn'))

        await findByTestId('description')
    })
})
