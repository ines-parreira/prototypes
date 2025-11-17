import type { ComponentProps, ReactNode } from 'react'

import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import type Modal from 'pages/common/components/modal/Modal'

import { GorgiasChatIntegrationLanguagesTableRowActions } from '../GorgiasChatIntegrationLanguagesTableRowActions'
import type { LanguageItemRow } from '../types'

jest.mock('pages/common/components/modal/Modal', () => {
    return ({ children, isOpen, onClose }: ComponentProps<typeof Modal>) => (
        <div>
            {isOpen ? children : null}
            <div onClick={onClose}>Close</div>
        </div>
    )
})

jest.mock(
    'pages/common/components/modal/ModalBody',
    () =>
        ({ children }: { children: ReactNode }) => {
            return <div>{children}</div>
        },
)

jest.mock(
    'pages/common/components/modal/ModalHeader',
    () =>
        ({ children }: { children: ReactNode }) => {
            return <div>{children}</div>
        },
)

jest.mock(
    'pages/common/components/modal/ModalActionsFooter',
    () =>
        ({ children }: { children: ReactNode }) => {
            return <div>{children}</div>
        },
)

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

        const { getByText } = render(
            <MemoryRouter>
                <GorgiasChatIntegrationLanguagesTableRowActions
                    language={language}
                    onClickDelete={onDeleteMock}
                    onClickSetDefault={onSetDefaultMock}
                />
            </MemoryRouter>,
        )

        getByText('Customize')
        expect(getByText('more_vert')).toBeInTheDocument()
        expect(getByText(/make default language/i)).toBeInTheDocument()
        expect(getByText(/delete/i)).toBeInTheDocument()
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

        const { queryByText } = render(
            <MemoryRouter>
                <GorgiasChatIntegrationLanguagesTableRowActions
                    language={language}
                    onClickDelete={onDeleteMock}
                    onClickSetDefault={onSetDefaultMock}
                />
            </MemoryRouter>,
        )

        queryByText('Customize')
        expect(queryByText('more_vert')).not.toBeInTheDocument()
        expect(queryByText(/make default language/i)).not.toBeInTheDocument()
        expect(queryByText(/delete/i)).not.toBeInTheDocument()
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

        const { getByText } = render(
            <MemoryRouter>
                <GorgiasChatIntegrationLanguagesTableRowActions
                    language={language}
                    onClickDelete={onDeleteMock}
                    onClickSetDefault={onSetDefaultMock}
                />
            </MemoryRouter>,
        )

        userEvent.click(getByText('more_vert'))
        userEvent.click(getByText(/make default language/i))
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

        const { getByText, queryByText } = render(
            <MemoryRouter>
                <GorgiasChatIntegrationLanguagesTableRowActions
                    language={language}
                    onClickDelete={onDeleteMock}
                    onClickSetDefault={onSetDefaultMock}
                />
            </MemoryRouter>,
        )

        userEvent.click(getByText('more_vert'))
        userEvent.click(getByText(/delete/i))

        const content =
            /By deleting this language, your chat will not be displayed/
        expect(getByText(content)).toBeInTheDocument()

        userEvent.click(getByText(/keep language/i))

        expect(queryByText(content)).not.toBeInTheDocument()
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

        const { getByText, queryByText } = render(
            <MemoryRouter>
                <GorgiasChatIntegrationLanguagesTableRowActions
                    language={language}
                    onClickDelete={onDeleteMock}
                    onClickSetDefault={onSetDefaultMock}
                />
            </MemoryRouter>,
        )

        userEvent.click(getByText('more_vert'))

        userEvent.click(getByText(/delete/i))

        const content =
            /By deleting this language, your chat will not be displayed/
        expect(getByText(content)).toBeInTheDocument()

        userEvent.click(
            screen.getByRole('button', {
                name: /Delete/i,
            }),
        )

        expect(queryByText(content)).not.toBeInTheDocument()

        expect(onDeleteMock).toHaveBeenCalledWith(language)
    })
})
