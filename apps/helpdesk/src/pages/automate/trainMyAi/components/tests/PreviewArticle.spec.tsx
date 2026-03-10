import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { EditionManagerContextProvider } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import PreviewArticle from '../PreviewArticle'

const queryClient = mockQueryClient()

const mockStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>([
    thunk,
])

describe('<PreviewArticle />', () => {
    const initialState: DeepPartial<RootState> = {
        entities: {
            helpCenter: {
                helpCenters: {
                    helpCentersById: {
                        '1': getSingleHelpCenterResponseFixture,
                    },
                },
                articles: {
                    articlesById: {},
                },
                categories: {
                    categoriesById: {},
                },
            },
        },
        ui: {
            helpCenter: {
                currentId: 1,
                currentLanguage: 'en-US',
            },
        },
    }

    it('should render component', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(initialState)}>
                    <CurrentHelpCenterContext.Provider
                        value={getSingleHelpCenterResponseFixture}
                    >
                        <EditionManagerContextProvider>
                            <PreviewArticle
                                articleData={{
                                    available_locales: [],
                                    category_id: 1,
                                    created_datetime: '',
                                    translation: {
                                        draft_version_id: null,
                                        published_version_id: null,
                                        published_datetime: null,
                                        publisher_user_id: null,
                                        commit_message: null,
                                        version: null,
                                        article_id: 1,
                                        article_unlisted_id: '1',
                                        category_id: 1,
                                        content: 'article content',
                                        created_datetime: '',
                                        excerpt: 'excerpt',
                                        is_current: true,
                                        locale: 'en-US',
                                        seo_meta: {
                                            description: '',
                                            title: '',
                                        },
                                        slug: 'slug',
                                        title: 'title',
                                        updated_datetime: '',
                                        visibility_status: 'PUBLIC',
                                        customer_visibility: 'PUBLIC',
                                    },
                                    help_center_id: 1,
                                    id: 1,
                                    updated_datetime: '',
                                    unlisted_id: '1',
                                    ingested_resource_id: null,
                                }}
                                helpCenter={getSingleHelpCenterResponseFixture}
                            />
                        </EditionManagerContextProvider>
                    </CurrentHelpCenterContext.Provider>
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('article content')).toBeInTheDocument()
    })
})
