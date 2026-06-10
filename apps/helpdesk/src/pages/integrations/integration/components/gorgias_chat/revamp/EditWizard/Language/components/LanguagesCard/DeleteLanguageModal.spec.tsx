import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LANGUAGE } from 'constants/languages'

import { DeleteLanguageModal } from './DeleteLanguageModal'

const frenchLanguage = {
    language: LANGUAGE.FR,
    label: 'French',
    link: '/app/settings/channels/gorgias-chat/1/languages/fr',
    primary: false,
    showActions: true,
}

describe('DeleteLanguageModal', () => {
    describe('visibility', () => {
        it('should not render when language is null', () => {
            render(
                <DeleteLanguageModal
                    language={null}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onConfirm={jest.fn()}
                    onDiscard={jest.fn()}
                />,
            )

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        it('should render when a language is provided', () => {
            render(
                <DeleteLanguageModal
                    language={frenchLanguage}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onConfirm={jest.fn()}
                    onDiscard={jest.fn()}
                />,
            )

            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })
    })

    describe('content', () => {
        it('should display the language label in the title', () => {
            render(
                <DeleteLanguageModal
                    language={frenchLanguage}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onConfirm={jest.fn()}
                    onDiscard={jest.fn()}
                />,
            )

            expect(screen.getByText('Delete French')).toBeInTheDocument()
        })

        it('should mention the language label in the body text', () => {
            render(
                <DeleteLanguageModal
                    language={frenchLanguage}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onConfirm={jest.fn()}
                    onDiscard={jest.fn()}
                />,
            )

            expect(
                screen.getByText(/french/i, { selector: 'span' }),
            ).toBeInTheDocument()
        })
    })

    describe('manual installation instructions', () => {
        it('should show manual installation text when isOneClickInstallation is false', () => {
            render(
                <DeleteLanguageModal
                    language={frenchLanguage}
                    isUpdatePending={false}
                    isOneClickInstallation={false}
                    onConfirm={jest.fn()}
                    onDiscard={jest.fn()}
                />,
            )

            expect(
                screen.getByText(/manually installed chats/i),
            ).toBeInTheDocument()
        })

        it('should show manual installation text when isOneClickInstallation is undefined', () => {
            render(
                <DeleteLanguageModal
                    language={frenchLanguage}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onConfirm={jest.fn()}
                    onDiscard={jest.fn()}
                />,
            )

            expect(
                screen.getByText(/manually installed chats/i),
            ).toBeInTheDocument()
        })

        it('should hide manual installation text when isOneClickInstallation is true', () => {
            render(
                <DeleteLanguageModal
                    language={frenchLanguage}
                    isUpdatePending={false}
                    isOneClickInstallation={true}
                    onConfirm={jest.fn()}
                    onDiscard={jest.fn()}
                />,
            )

            expect(
                screen.queryByText(/manually installed chats/i),
            ).not.toBeInTheDocument()
        })
    })

    describe('actions', () => {
        it('should call onConfirm when Delete button is clicked', async () => {
            const user = userEvent.setup()
            const onConfirm = jest.fn()

            render(
                <DeleteLanguageModal
                    language={frenchLanguage}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onConfirm={onConfirm}
                    onDiscard={jest.fn()}
                />,
            )

            await user.click(screen.getByRole('button', { name: /^delete$/i }))

            expect(onConfirm).toHaveBeenCalledTimes(1)
        })

        it('should call onDiscard when modal is dismissed via onOpenChange', async () => {
            const user = userEvent.setup()
            const onDiscard = jest.fn()

            render(
                <DeleteLanguageModal
                    language={frenchLanguage}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onConfirm={jest.fn()}
                    onDiscard={onDiscard}
                />,
            )

            await user.keyboard('{Escape}')

            expect(onDiscard).toHaveBeenCalledTimes(1)
        })

        it('should call onDiscard when Keep Language button is clicked', async () => {
            const user = userEvent.setup()
            const onDiscard = jest.fn()

            render(
                <DeleteLanguageModal
                    language={frenchLanguage}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onConfirm={jest.fn()}
                    onDiscard={onDiscard}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /keep language/i }),
            )

            expect(onDiscard).toHaveBeenCalledTimes(1)
        })

        it('should disable the Keep Language button when update is pending', () => {
            render(
                <DeleteLanguageModal
                    language={frenchLanguage}
                    isUpdatePending={true}
                    isOneClickInstallation={undefined}
                    onConfirm={jest.fn()}
                    onDiscard={jest.fn()}
                />,
            )

            expect(
                screen.getByRole('button', { name: /keep language/i }),
            ).toBeDisabled()
        })

        it('should disable the Delete button when update is pending', () => {
            render(
                <DeleteLanguageModal
                    language={frenchLanguage}
                    isUpdatePending={true}
                    isOneClickInstallation={undefined}
                    onConfirm={jest.fn()}
                    onDiscard={jest.fn()}
                />,
            )

            expect(
                screen.getByRole('button', { name: /delete/i }),
            ).toBeDisabled()
        })

        it('should call onDiscard when modal is dismissed and update is not pending', async () => {
            const user = userEvent.setup()
            const onDiscard = jest.fn()

            render(
                <DeleteLanguageModal
                    language={frenchLanguage}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onConfirm={jest.fn()}
                    onDiscard={onDiscard}
                />,
            )

            await user.keyboard('{Escape}')

            expect(onDiscard).toHaveBeenCalledTimes(1)
        })

        it('should not call onDiscard when modal is dismissed while update is pending', async () => {
            const user = userEvent.setup()
            const onDiscard = jest.fn()

            render(
                <DeleteLanguageModal
                    language={frenchLanguage}
                    isUpdatePending={true}
                    isOneClickInstallation={undefined}
                    onConfirm={jest.fn()}
                    onDiscard={onDiscard}
                />,
            )

            await user.keyboard('{Escape}')

            expect(onDiscard).not.toHaveBeenCalled()
        })
    })
})
