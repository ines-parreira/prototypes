import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {GorgiasChatIntegrationLanguagesTableRowActions} from '../GorgiasChatIntegrationLanguagesTableRowActions'
import {LanguageItemRow} from '../types'

describe('<GorgiasChatIntegrationLanguagesTableRowActions />', () => {
    it('renders actions if show actions is enabled', () => {
        const onSetDefaultMock = jest.fn()
        const onDeleteMock = jest.fn()
        const language = {
            language: 'en-US',
            primary: true,
            label: 'English (US)',
            link: '/app/settings/channels/gorgias_chat/1/language/en-US',
            showActions: true,
        } as LanguageItemRow

        const {getByText, queryByTestId} = render(
            <GorgiasChatIntegrationLanguagesTableRowActions
                language={language}
                onClickDelete={onDeleteMock}
                onClickSetDefault={onSetDefaultMock}
            />
        )

        getByText('Customize')
        expect(queryByTestId('more-actions-button')).toBeInTheDocument()
        expect(queryByTestId('action-set-default-button')).toBeInTheDocument()
        expect(queryByTestId('action-delete-button')).toBeInTheDocument()
    })

    it('renders no actions if show actions is disabled', () => {
        const onSetDefaultMock = jest.fn()
        const onDeleteMock = jest.fn()
        const language = {
            language: 'en-US',
            primary: true,
            label: 'English (US)',
            link: '/app/settings/channels/gorgias_chat/1/language/en-US',
            showActions: false,
        } as LanguageItemRow

        const {getByText, queryByTestId} = render(
            <GorgiasChatIntegrationLanguagesTableRowActions
                language={language}
                onClickDelete={onDeleteMock}
                onClickSetDefault={onSetDefaultMock}
            />
        )

        getByText('Customize')
        expect(queryByTestId('more-actions-button')).not.toBeInTheDocument()
        expect(
            queryByTestId('action-set-default-button')
        ).not.toBeInTheDocument()
        expect(queryByTestId('action-delete-button')).not.toBeInTheDocument()
    })

    it('calls onClickSetDefault with passed language', () => {
        const onSetDefaultMock = jest.fn()
        const onDeleteMock = jest.fn()
        const language = {
            language: 'en-US',
            primary: true,
            label: 'English (US)',
            link: '/app/settings/channels/gorgias_chat/1/language/en-US',
            showActions: true,
        } as LanguageItemRow

        render(
            <GorgiasChatIntegrationLanguagesTableRowActions
                language={language}
                onClickDelete={onDeleteMock}
                onClickSetDefault={onSetDefaultMock}
            />
        )

        userEvent.click(screen.getByTestId('more-actions-button'))
        userEvent.click(screen.getByTestId('action-set-default-button'))
        expect(onSetDefaultMock).toHaveBeenCalledWith(language)
    })

    it('renders delete confirmation modal and discards it', () => {
        const onSetDefaultMock = jest.fn()
        const onDeleteMock = jest.fn()
        const language = {
            language: 'en-US',
            primary: true,
            label: 'English (US)',
            link: '/app/settings/channels/gorgias_chat/1/language/en-US',
            showActions: true,
        } as LanguageItemRow

        render(
            <GorgiasChatIntegrationLanguagesTableRowActions
                language={language}
                onClickDelete={onDeleteMock}
                onClickSetDefault={onSetDefaultMock}
            />
        )

        userEvent.click(screen.getByTestId('more-actions-button'))
        userEvent.click(screen.getByTestId('action-delete-button'))

        expect(screen.getByRole('dialog')).toHaveClass('open')

        userEvent.click(screen.getByTestId('discard-delete-button'))

        expect(screen.getByRole('dialog')).not.toHaveClass('open')
        expect(onDeleteMock).not.toHaveBeenCalled()
    })

    it('renders delete confirmation modal and calls onClickDelete with passed language', () => {
        const onSetDefaultMock = jest.fn()
        const onDeleteMock = jest.fn()
        const language = {
            language: 'en-US',
            primary: true,
            label: 'English (US)',
            link: '/app/settings/channels/gorgias_chat/1/language/en-US',
            showActions: true,
        } as LanguageItemRow

        render(
            <GorgiasChatIntegrationLanguagesTableRowActions
                language={language}
                onClickDelete={onDeleteMock}
                onClickSetDefault={onSetDefaultMock}
            />
        )

        userEvent.click(screen.getByTestId('more-actions-button'))
        userEvent.click(screen.getByTestId('action-delete-button'))

        expect(screen.getByRole('dialog')).toHaveClass('open')

        userEvent.click(screen.getByTestId('confirm-delete-button'))

        expect(screen.getByRole('dialog')).not.toHaveClass('open')
        expect(onDeleteMock).toHaveBeenCalledWith(language)
    })
})
