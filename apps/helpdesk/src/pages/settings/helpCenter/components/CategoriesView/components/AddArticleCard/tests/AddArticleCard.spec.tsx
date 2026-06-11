import React from 'react'

import { render, userEvent } from '@repo/testing'

import { AddArticleCard } from '../AddArticleCard'

describe('AddArticleCard', () => {
    it('should call onCreateArticle when clicked and canUpdateArticle is true', () => {
        const onCreateArticleMock = jest.fn()
        const { container } = render(
            <AddArticleCard
                onCreateArticle={onCreateArticleMock}
                canUpdateArticle={true}
            />,
        )

        userEvent.click(container.firstChild as HTMLElement)

        expect(onCreateArticleMock).toHaveBeenCalled()
    })

    it('should not call onCreateArticle when clicked and canUpdateArticle is false', () => {
        const onCreateArticleMock = jest.fn()
        const { container } = render(
            <AddArticleCard
                onCreateArticle={onCreateArticleMock}
                canUpdateArticle={false}
            />,
        )

        userEvent.click(container.firstChild as HTMLElement)

        expect(onCreateArticleMock).not.toHaveBeenCalled()
    })
})
