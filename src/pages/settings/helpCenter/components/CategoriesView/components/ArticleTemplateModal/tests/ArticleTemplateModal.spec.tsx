import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ArticleTemplatesListFixture } from 'pages/settings/helpCenter/fixtures/articleTemplate.fixture'

import { ArticleTemplateModal } from '../ArticleTemplateModal'

const template = ArticleTemplatesListFixture[0]
const onCloseMock = jest.fn()
const onCreateArticleWithTemplateMock = jest.fn()

describe('ArticleTemplateModal', () => {
    it('displays the modal', () => {
        render(
            <ArticleTemplateModal
                isOpen={true}
                canUpdateArticle={true}
                onClose={onCloseMock}
                template={template}
                onCreateArticleWithTemplate={onCreateArticleWithTemplateMock}
            />,
        )
        const title = screen.getAllByText(template.title)[0]
        expect(title).toBeInTheDocument()
        expect(title).toHaveTextContent(template.title)
    })

    it('calls the onClose callback when the close button is clicked', () => {
        render(
            <ArticleTemplateModal
                isOpen={true}
                canUpdateArticle={true}
                onClose={onCloseMock}
                template={template}
                onCreateArticleWithTemplate={onCreateArticleWithTemplateMock}
            />,
        )
        const closeButton = screen.getByText(/cancel/i)
        userEvent.click(closeButton)
        expect(onCloseMock).toHaveBeenCalled()
    })

    it('calls the onCreateArticleWithTemplate callback when the create button is clicked', () => {
        render(
            <ArticleTemplateModal
                isOpen={true}
                canUpdateArticle={true}
                onClose={onCloseMock}
                template={template}
                onCreateArticleWithTemplate={onCreateArticleWithTemplateMock}
            />,
        )
        const createButton = screen.getByText(/Use template/i)
        userEvent.click(createButton)
        expect(onCreateArticleWithTemplateMock).toHaveBeenCalled()
    })
})
