import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {AIArticlesListFixture} from 'pages/settings/helpCenter/fixtures/aiArticles.fixture'
import AIArticleRow, {AIArticleRowProps} from '../AIArticleRow'

describe('AIArticleRow', () => {
    const article = AIArticlesListFixture[0]

    const defaultProps: AIArticleRowProps = {
        article,
        isNew: false,
        isActive: false,
        onSelect: jest.fn(),
    }

    it('renders without errors', () => {
        render(<AIArticleRow {...defaultProps} />)
        expect(screen.getByText(article.title)).toBeInTheDocument()
    })

    it('calls onSelect when clicked', () => {
        const onSelect = jest.fn()
        const props: AIArticleRowProps = {
            ...defaultProps,
            onSelect,
        }
        const {getByTestId} = render(<AIArticleRow {...props} />)
        const articleRow = getByTestId('ai-article-row')
        userEvent.click(articleRow)
        expect(onSelect).toHaveBeenCalledWith(article)
    })
})
