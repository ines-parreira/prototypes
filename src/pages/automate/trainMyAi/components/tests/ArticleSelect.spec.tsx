import {screen, render} from '@testing-library/react'
import React from 'react'

import {assumeMock} from 'utils/testing'

import useHelpCenterArticleTree from '../../hooks/useHelpCenterArticleTree'
import ArticleSelect from '../ArticleSelect'

jest.mock('../../hooks/useHelpCenterArticleTree')

const mockUseHelpCenterArticleTree = assumeMock(useHelpCenterArticleTree)

describe('<ArticleSelect />', () => {
    it('should render component', () => {
        mockUseHelpCenterArticleTree.mockReturnValue({
            isInitialLoading: true,
            isLoading: false,
            map: new Map([[1, '1']]),
            data: {
                updated_datetime: '',
                unlisted_id: '1',
                articles: [],
                id: 1,
                available_locales: [],
                children: [],
                created_datetime: '',
                help_center_id: 1,
                translation: {
                    category_id: 1,
                    category_unlisted_id: '1',
                    created_datetime: '',
                    description: 'description',
                    image_url: '',
                    locale: 'en-US',
                    parent_category_id: 0,
                    seo_meta: {
                        description: '',
                        title: '',
                    },
                    slug: 'slug',
                    title: 'title',
                    updated_datetime: '',
                    visibility_status: 'PUBLIC',
                },
            },
        })
        render(<ArticleSelect helpCenterId={1} onChange={jest.fn()} />)

        expect(screen.getByText(/select an article/i)).toBeInTheDocument()
    })
})
