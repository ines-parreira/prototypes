import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { SearchSpotlightHeader } from '../SearchSpotlightHeader'

describe('SearchSpotlightHeader', () => {
    it('renders the search field and advanced search button', async () => {
        const onGoToAdvancedSearch = vi.fn()
        const onSearchQueryChange = vi.fn()
        const { user } = render(
            <SearchSpotlightHeader
                placeholder="Search for anything..."
                searchInputRef={{ current: null }}
                searchQuery=""
                selectedSection="tickets"
                onGoToAdvancedSearch={onGoToAdvancedSearch}
                onSearchQueryChange={onSearchQueryChange}
            />,
        )

        await user.type(
            screen.getByRole('searchbox', { name: /search for anything/i }),
            'Ada',
        )
        await user.click(
            screen.getByRole('button', { name: /advanced search/i }),
        )

        expect(onSearchQueryChange).toHaveBeenCalled()
        expect(onGoToAdvancedSearch).toHaveBeenCalledTimes(1)
    })

    it('disables advanced search in the calls section', () => {
        render(
            <SearchSpotlightHeader
                placeholder="Search for anything..."
                searchInputRef={{ current: null }}
                searchQuery=""
                selectedSection="calls"
                onGoToAdvancedSearch={vi.fn()}
                onSearchQueryChange={vi.fn()}
            />,
        )

        expect(
            screen.getByRole('button', { name: /advanced search/i }),
        ).toBeDisabled()
    })
})
