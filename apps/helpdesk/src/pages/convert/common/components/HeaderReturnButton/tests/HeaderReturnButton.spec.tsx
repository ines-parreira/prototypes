import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { HeaderReturnButton } from '../HeaderReturnButton'

describe('<HeaderReturnButton />', () => {
    it('sets the right href', () => {
        const { getByText } = render(
            <MemoryRouter>
                <HeaderReturnButton
                    backToHref="/back-to-campaigns"
                    title="Back to Campaigns list"
                />
            </MemoryRouter>,
        )

        expect(
            getByText('Back to Campaigns list').getAttribute('href'),
        ).toEqual('/back-to-campaigns')
    })

    describe('Header button shows back text', () => {
        it('renders the "Back to Campaigns list" title', () => {
            const { getByText } = render(
                <MemoryRouter>
                    <HeaderReturnButton
                        backToHref="/"
                        title="Back to Campaigns list"
                    />
                </MemoryRouter>,
            )
            getByText('Back to Campaigns list')
        })
    })
})
