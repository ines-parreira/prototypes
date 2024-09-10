import React, {createRef} from 'react'
import {act, fireEvent, render, waitFor} from '@testing-library/react'

import {SelectableOption} from 'pages/common/forms/SelectField/types'
import {AIArticle} from 'models/helpCenter/types'

import AIArticleArchiveModal, {
    AIArticleArchiveModalHandle,
    ArchiveReason,
} from '../AIArticleArchiveModal'

jest.mock('pages/common/forms/SelectField/SelectField', () => ({
    __esModule: true,
    default: ({
        options,
        onChange,
    }: {
        options: SelectableOption[]
        onChange: (value: any) => void
    }) => (
        <>
            {options.map((option) => (
                <button
                    key={option.value}
                    data-testid={option.value}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </>
    ),
}))

describe('<AIArticleArchiveModal />', () => {
    it('should be hidden by default', () => {
        const {queryByRole} = render(
            <AIArticleArchiveModal onArchive={() => ({})} />
        )

        expect(queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should be visible when opened', () => {
        const article: AIArticle = {
            key: '1',
            title: 'Test Article',
            html_content: 'Test Content',
            excerpt: 'Test Excerpt',
            category: 'Test Category',
            score: 1,
            related_tickets_count: 1,
            batch_datetime: '2021-01-01T00:00:00Z',
        }

        const ref = createRef<AIArticleArchiveModalHandle>()
        const {queryByRole} = render(
            <AIArticleArchiveModal onArchive={() => ({})} ref={ref} />
        )
        act(() => ref.current?.open(article))

        expect(queryByRole('dialog')).toBeInTheDocument()
    })

    it('should call onArchive with article and reason', async () => {
        const article: AIArticle = {
            key: '1',
            title: 'Test Article',
            html_content: 'Test Content',
            excerpt: 'Test Excerpt',
            category: 'Test Category',
            score: 1,
            related_tickets_count: 1,
            batch_datetime: '2021-01-01T00:00:00Z',
        }

        const onArchiveMock = jest.fn()

        const ref = createRef<AIArticleArchiveModalHandle>()
        const {getByText, getByPlaceholderText, getByRole} = render(
            <AIArticleArchiveModal onArchive={onArchiveMock} ref={ref} />
        )
        act(() => ref.current?.open(article))

        expect(getByRole('button', {name: 'Archive'})).toBeAriaDisabled()

        fireEvent.click(getByText(ArchiveReason.AlreadyExists))

        const textarea = getByPlaceholderText('Type your reason here...')

        await waitFor(() => expect(textarea).not.toBeVisible())

        fireEvent.click(getByText('Archive'))

        expect(onArchiveMock).toHaveBeenCalledWith(
            article,
            ArchiveReason.AlreadyExists
        )
    })

    it('should call onArchive with article and "Other" reason specified by user input', async () => {
        const article: AIArticle = {
            key: '1',
            title: 'Test Article',
            html_content: 'Test Content',
            excerpt: 'Test Excerpt',
            category: 'Test Category',
            score: 1,
            related_tickets_count: 1,
            batch_datetime: '2021-01-01T00:00:00Z',
        }

        const onArchiveMock = jest.fn()

        const ref = createRef<AIArticleArchiveModalHandle>()
        const {getByText, getByPlaceholderText, getByRole} = render(
            <AIArticleArchiveModal onArchive={onArchiveMock} ref={ref} />
        )
        act(() => ref.current?.open(article))

        expect(getByRole('button', {name: 'Archive'})).toBeAriaDisabled()

        fireEvent.click(getByText(ArchiveReason.Other))

        const textarea = getByPlaceholderText('Type your reason here...')

        await waitFor(() => expect(textarea).toBeVisible())

        fireEvent.change(textarea, {target: {value: 'Test reason'}})

        fireEvent.click(getByText('Archive'))

        expect(onArchiveMock).toHaveBeenCalledWith(article, 'Test reason')
    })
})
