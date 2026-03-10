import React from 'react'

import { fireEvent, render, waitFor } from '@testing-library/react'

import { getSingleHelpCenterResponseFixture as helpCenter } from '../../fixtures/getHelpCentersResponse.fixture'
import { SearchContextProvider } from '../../providers/SearchContext'
import type {
    AlgoliaSearchResult,
    EntitiesBaseRecord,
} from '../../types/algolia'
import { SearchBar } from './SearchBar'

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('lodash/debounce', () => jest.fn((fn) => fn))

const initSearchClient = jest.spyOn(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('pages/settings/helpCenter/utils/algolia'),
    'initSearchClient',
)

const search = jest.fn()

describe('SearchBar', () => {
    beforeEach(() => {
        search.mockImplementation(
            (): Promise<AlgoliaSearchResult<EntitiesBaseRecord>> =>
                Promise.resolve({
                    results: [
                        {
                            objectID: 'my-object-id-42',
                            id: 42,
                            help_center_id: 5,
                            locale: 'en-US',

                            title: 'My Title',
                            title_draft: 'My Title',
                            slug: 'my-title',
                            slug_draft: 'my-title',
                            preview: 'my...',
                            preview_draft: 'my...',
                            gorgias_domain: 'goose.gorgias.docker',
                            custom_domain: '',

                            parent_category_1: null,
                            parent_category_2: null,
                            parent_category_3: null,

                            customer_visibility: 'PUBLIC',
                        },
                    ],
                    resultsCount: 1,
                    nbPages: 1,
                }),
        )
    })

    it('triggers search when searchInput is not empty', async () => {
        initSearchClient.mockImplementationOnce(() =>
            Promise.resolve({
                search,
            }),
        )

        const { container, getByRole, rerender } = render(
            <SearchContextProvider helpCenter={helpCenter}>
                <SearchBar />
            </SearchContextProvider>,
        )

        await waitFor(() => {
            expect(initSearchClient).toHaveBeenCalledTimes(1)
        })

        rerender(
            <SearchContextProvider helpCenter={helpCenter}>
                <SearchBar />
            </SearchContextProvider>,
        )

        expect(container).toMatchSnapshot()

        fireEvent.change(getByRole('textbox'), {
            target: { value: 'my search' },
        })

        await waitFor(() => {
            expect(search).toHaveBeenCalledTimes(1)
            expect(search).toHaveBeenLastCalledWith('my search', {
                facetFilters: [],
                highlightPostTag: '</span>',
                highlightPreTag: '<span class="search-highlight">',
                restrictSearchableAttributes: [
                    'title_draft',
                    'preview_draft',
                    'article_content_draft',
                ],
                tagFilters: ['latest_draft'],
            })
        })

        rerender(
            <SearchContextProvider helpCenter={helpCenter}>
                <SearchBar />
            </SearchContextProvider>,
        )

        // it should have search clear button when search input is not empty
        expect(container).toMatchSnapshot()
    })

    it('does not trigger search if the input is only spaces or less than 3 letters', async () => {
        initSearchClient.mockImplementationOnce(() =>
            Promise.resolve({
                search,
            }),
        )

        const { getByRole, rerender } = render(
            <SearchContextProvider helpCenter={helpCenter}>
                <SearchBar />
            </SearchContextProvider>,
        )

        await waitFor(() => {
            expect(initSearchClient).toHaveBeenCalledTimes(1)
        })

        rerender(
            <SearchContextProvider helpCenter={helpCenter}>
                <SearchBar />
            </SearchContextProvider>,
        )

        fireEvent.change(getByRole('textbox'), {
            target: { value: '     ' },
        })

        await waitFor(() => {
            expect(search).toHaveBeenCalledTimes(0)
        })

        fireEvent.change(getByRole('textbox'), {
            target: { value: '  te   ' },
        })

        await waitFor(() => {
            expect(search).toHaveBeenCalledTimes(0)
        })

        fireEvent.change(getByRole('textbox'), {
            target: { value: '  tes   ' },
        })

        await waitFor(() => {
            expect(search).toHaveBeenCalledTimes(1)
        })
    })

    it('renders disabled input if the search client could not be initialized', async () => {
        initSearchClient.mockImplementationOnce(() =>
            Promise.resolve('no_index'),
        )

        const { container, rerender } = render(
            <SearchContextProvider helpCenter={helpCenter}>
                <SearchBar />
            </SearchContextProvider>,
        )

        await waitFor(() => {
            expect(initSearchClient).toHaveBeenCalledTimes(1)
        })

        rerender(
            <SearchContextProvider helpCenter={helpCenter}>
                <SearchBar />
            </SearchContextProvider>,
        )

        expect(container.firstChild?.lastChild).toHaveProperty('disabled')
    })
})
