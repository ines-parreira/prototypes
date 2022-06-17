import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'

import {getSingleHelpCenterResponseFixture as helpCenter} from '../../fixtures/getHelpCentersResponse.fixture'
import {useSearchContext} from '../../providers/SearchContext'
import {useHelpCenterIdParam} from '../../hooks/useHelpCenterIdParam'

import {useSupportedLocales} from '../../providers/SupportedLocales'
import {getLocalesResponseFixture} from '../../fixtures/getLocalesResponse.fixtures'

import {SearchView} from './SearchView'

jest.mock('../../providers/SearchContext')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterIdParam')
;(useHelpCenterIdParam as jest.Mock).mockReturnValue(helpCenter.id)

jest.mock('../../providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': helpCenter,
                },
            },
            articles: {articlesById: {}},
            categories: {
                categoriesById: {
                    '0': {
                        created_datetime: '2022-03-07T14:46:47.212Z',
                        updated_datetime: '2022-03-07T14:46:47.212Z',
                        deleted_datetime: null,
                        id: 0,
                        help_center_id: 1,
                        available_locales: [],
                        translation: null,
                        children: [1],
                        articles: [],
                    },
                    '28': {
                        created_datetime: '2022-03-07T14:46:47.212Z',
                        updated_datetime: '2022-03-07T14:46:47.212Z',
                        deleted_datetime: null,
                        id: 28,
                        help_center_id: 1,
                        available_locales: ['en-US'],
                        translation: {
                            created_datetime: '2022-03-07T14:47:03.686Z',
                            updated_datetime: '2022-03-07T14:47:03.686Z',
                            deleted_datetime: null,
                            parent_category_id: null,
                            description: '',
                            slug: 'cat-1-mod',
                            title: 'Cat 1 mod',
                            category_id: 28,
                            locale: 'en-US',
                            seo_meta: {
                                title: null,
                                description: null,
                            },
                        },
                        children: [],
                        articles: [],
                    },
                },
            },
        },
    } as any,
    ui: {helpCenter: {currentId: 1, currentLanguage: 'en-US'}} as any,
}

const store = mockStore(defaultState)

describe('SearchView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('shows only search bar if search input is empty', () => {
        ;(useSearchContext as jest.Mock).mockReturnValue({
            searchInput: '',
            searchResults: null,
            searchReady: true,
        })

        const {container} = render(
            <SearchView
                helpCenter={helpCenter}
                onArticleClick={jest.fn()}
                onArticleClickSettings={jest.fn()}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('shows only search bar if search is in erroneous state', () => {
        ;(useSearchContext as jest.Mock).mockReturnValue({
            searchInput: 'some input',
            searchResults: {
                state: 'error',
                error: new Error('something fishy'),
            },
            searchReady: true,
        })

        const {container} = render(
            <SearchView
                helpCenter={helpCenter}
                onArticleClick={jest.fn()}
                onArticleClickSettings={jest.fn()}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('shows search bar and loader if search is ongoing', () => {
        ;(useSearchContext as jest.Mock).mockReturnValue({
            searchInput: 'some input',
            searchResults: {
                state: 'loading',
            },
            searchReady: true,
        })

        const {container} = render(
            <SearchView
                helpCenter={helpCenter}
                onArticleClick={jest.fn()}
                onArticleClickSettings={jest.fn()}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('shows the no result message if there are 0 results for a given search', () => {
        ;(useSearchContext as jest.Mock).mockReturnValue({
            searchInput: 'some input',
            searchResults: {
                state: 'ready',
                results: [],
                resultsCount: 0,
                nbPages: 0,
            },
            searchReady: true,
        })

        const {container} = render(
            <SearchView
                helpCenter={helpCenter}
                onArticleClick={jest.fn()}
                onArticleClickSettings={jest.fn()}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('displays search results', () => {
        ;(useSearchContext as jest.Mock).mockReturnValue({
            searchInput: 'some input',
            searchResults: {
                state: 'ready',
                results: [
                    {
                        gorgias_domain: 'goose.gorgias.docker',
                        custom_domain: '',
                        title: 'Cat 1 mod',
                        preview: '',
                        slug: 'cat-1-mod',
                        title_draft: 'Cat 1 mod',
                        preview_draft: '',
                        slug_draft: 'cat-1-mod',
                        parent_category_1: null,
                        parent_category_2: null,
                        parent_category_3: null,
                        visibility_status: 'PUBLIC',
                        id: 28,
                        help_center_id: 1,
                        locale: 'en-US',
                        type: 'category',
                        _tags: ['latest_draft', 'current'],
                        objectID: 'category-28/en-US',
                        _snippetResult: {
                            preview: {
                                value: '',
                                matchLevel: 'none',
                            },
                        },
                        _highlightResult: {
                            title: {
                                value: 'Cat 1 <span class="search-highlight">mod</span>',
                                matchLevel: 'full',
                                fullyHighlighted: false,
                                matchedWords: ['mod'],
                            },
                            preview: {
                                value: '',
                                matchLevel: 'none',
                                matchedWords: [],
                            },
                            title_draft: {
                                value: 'Cat 1 <span class="search-highlight">mod</span>',
                                matchLevel: 'full',
                                fullyHighlighted: false,
                                matchedWords: ['mod'],
                            },
                            preview_draft: {
                                value: '',
                                matchLevel: 'none',
                                matchedWords: [],
                            },
                        },
                    },
                ],
                resultsCount: 1,
                nbPages: 1,
            },
            searchReady: true,
        })

        const {container} = render(
            <Provider store={store}>
                <SearchView
                    helpCenter={helpCenter}
                    onArticleClick={jest.fn()}
                    onArticleClickSettings={jest.fn()}
                />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })
})
