import { render, screen } from '@testing-library/react'

import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'

import { KnowledgeEditorHelpCenterArticle } from './KnowledgeEditorHelpCenterArticle'
import { InitialArticleMode } from './KnowledgeEditorHelpCenterExistingArticle'

jest.mock('./KnowledgeEditorHelpCenterExistingArticle', () => ({
    KnowledgeEditorHelpCenterExistingArticle: (__props: any) => (
        <>
            <div>EXISTING ARTICLE</div>
        </>
    ),
}))

jest.mock('./KnowledgeEditorHelpCenterNewArticle', () => ({
    KnowledgeEditorHelpCenterNewArticle: (__props: any) => (
        <>
            <div>NEW ARTICLE</div>
        </>
    ),
}))

describe('KnowledgeEditorHelpCenterArticle', () => {
    it('renders existing article', () => {
        render(
            <KnowledgeEditorHelpCenterArticle
                helpCenter={getHelpCentersResponseFixture.data[0]}
                locales={getLocalesResponseFixture}
                categories={[]}
                onClickPrevious={() => {}}
                onClickNext={() => {}}
                onClose={() => {}}
                article={{
                    type: 'existing',
                    initialArticleMode: 'read' as InitialArticleMode,
                    articleId: 1,
                }}
            />,
        )

        expect(screen.getByText('EXISTING ARTICLE')).toBeInTheDocument()
    })

    it('renders new article', () => {
        render(
            <KnowledgeEditorHelpCenterArticle
                helpCenter={getHelpCentersResponseFixture.data[0]}
                locales={getLocalesResponseFixture}
                categories={[]}
                onClickPrevious={() => {}}
                onClickNext={() => {}}
                onClose={() => {}}
                article={{
                    type: 'new',
                    template: {
                        title: 'Test Article',
                        content: 'Test Content',
                        key: 'test-template',
                    },
                    onCreated: () => {},
                }}
            />,
        )

        expect(screen.getByText('NEW ARTICLE')).toBeInTheDocument()
    })
})
