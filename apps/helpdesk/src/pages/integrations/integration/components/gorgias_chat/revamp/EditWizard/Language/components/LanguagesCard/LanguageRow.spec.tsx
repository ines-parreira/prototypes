import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router-dom'

import { LANGUAGE } from 'constants/languages'

import { LanguageRow } from './LanguageRow'

const defaultLanguage = {
    language: LANGUAGE.EN_US,
    label: 'English - US',
    link: '/app/settings/channels/gorgias-chat/1/languages/en-US',
    primary: false,
    showActions: true,
}

const openActionsMenu = async () => {
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /more actions/i }))

    return user
}

describe('LanguageRow', () => {
    describe('language name', () => {
        it('should render the language label', () => {
            render(
                <LanguageRow
                    language={defaultLanguage}
                    isUpdatePending={false}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            expect(screen.getByText('English - US')).toBeInTheDocument()
        })

        it('should render Default tag when language is primary', () => {
            const primaryLanguage = { ...defaultLanguage, primary: true }

            render(
                <LanguageRow
                    language={primaryLanguage}
                    isUpdatePending={false}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            expect(screen.getByText('Default')).toBeInTheDocument()
        })

        it('should not render Default tag when language is not primary', () => {
            render(
                <LanguageRow
                    language={defaultLanguage}
                    isUpdatePending={false}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            expect(screen.queryByText('Default')).not.toBeInTheDocument()
        })
    })

    describe('Customize button', () => {
        it('should navigate to language link when Customize is clicked', async () => {
            const user = userEvent.setup()

            render(
                <>
                    <LanguageRow
                        language={defaultLanguage}
                        isUpdatePending={false}
                        onClickSetDefault={jest.fn()}
                        onOpenDeleteModal={jest.fn()}
                    />
                    <Route path={defaultLanguage.link}>Language settings</Route>
                </>,
            )

            await user.click(screen.getByRole('button', { name: /customize/i }))

            expect(await screen.findByText('Language settings')).toBeVisible()
        })

        it('should disable the Customize button when update is pending', () => {
            render(
                <LanguageRow
                    language={defaultLanguage}
                    isUpdatePending={true}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            expect(
                screen.getByRole('button', { name: /customize/i }),
            ).toBeDisabled()
        })
    })

    describe('actions menu', () => {
        it('should render the More actions button when showActions is true', () => {
            render(
                <LanguageRow
                    language={defaultLanguage}
                    isUpdatePending={false}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            expect(
                screen.getByRole('button', { name: /more actions/i }),
            ).toBeInTheDocument()
        })

        it('should not render the More actions button when showActions is false', () => {
            const singleLanguage = { ...defaultLanguage, showActions: false }

            render(
                <LanguageRow
                    language={singleLanguage}
                    isUpdatePending={false}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            expect(
                screen.queryByRole('button', { name: /more actions/i }),
            ).not.toBeInTheDocument()
        })

        it('should disable the More actions button when language is primary', () => {
            const primaryLanguage = {
                ...defaultLanguage,
                primary: true,
                showActions: true,
            }

            render(
                <LanguageRow
                    language={primaryLanguage}
                    isUpdatePending={false}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            expect(
                screen.getByRole('button', { name: /more actions/i }),
            ).toBeDisabled()
        })

        it('should disable the More actions button when update is pending', () => {
            render(
                <LanguageRow
                    language={defaultLanguage}
                    isUpdatePending={true}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            expect(
                screen.getByRole('button', { name: /more actions/i }),
            ).toBeDisabled()
        })

        it('should call onClickSetDefault when Make default language is clicked', async () => {
            const onClickSetDefault = jest.fn()

            render(
                <LanguageRow
                    language={defaultLanguage}
                    isUpdatePending={false}
                    onClickSetDefault={onClickSetDefault}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            const user = await openActionsMenu()
            await user.click(
                await screen.findByRole('menuitem', {
                    name: /make default language/i,
                }),
            )

            expect(onClickSetDefault).toHaveBeenCalledWith(defaultLanguage)
        })

        it('should call onOpenDeleteModal when Delete is clicked', async () => {
            const onOpenDeleteModal = jest.fn()

            render(
                <LanguageRow
                    language={defaultLanguage}
                    isUpdatePending={false}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={onOpenDeleteModal}
                />,
            )

            const user = await openActionsMenu()
            await user.click(
                await screen.findByRole('menuitem', { name: /^delete$/i }),
            )

            expect(onOpenDeleteModal).toHaveBeenCalledWith(defaultLanguage)
        })
    })
})
