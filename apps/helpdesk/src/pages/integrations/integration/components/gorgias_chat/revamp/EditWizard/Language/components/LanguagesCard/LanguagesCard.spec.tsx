import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LANGUAGE } from 'constants/languages'

import { LanguagesCard } from './LanguagesCard'

const primaryRow = {
    language: LANGUAGE.EN_US,
    label: 'English - US',
    link: '/app/settings/channels/gorgias-chat/1/languages/en-US',
    primary: true,
    showActions: true,
}

const secondaryRow = {
    language: LANGUAGE.FR,
    label: 'French',
    link: '/app/settings/channels/gorgias-chat/1/languages/fr',
    primary: false,
    showActions: true,
}

const openActionsMenu = async () => {
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /more actions/i }))

    return user
}

describe('LanguagesCard', () => {
    describe('rendering', () => {
        it('should render Language column header', () => {
            render(
                <LanguagesCard
                    languagesRows={[primaryRow]}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onClickSetDefault={jest.fn()}
                    onClickDelete={jest.fn()}
                />,
            )

            expect(screen.getByText('Language')).toBeInTheDocument()
        })

        it('should render each language row', () => {
            render(
                <LanguagesCard
                    languagesRows={[primaryRow, secondaryRow]}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onClickSetDefault={jest.fn()}
                    onClickDelete={jest.fn()}
                />,
            )

            expect(screen.getByText('English - US')).toBeInTheDocument()
            expect(screen.getByText('French')).toBeInTheDocument()
        })

        it('should not show delete modal by default', () => {
            render(
                <LanguagesCard
                    languagesRows={[secondaryRow]}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onClickSetDefault={jest.fn()}
                    onClickDelete={jest.fn()}
                />,
            )

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    describe('delete flow', () => {
        it('should open the delete modal when Delete menu item is clicked', async () => {
            render(
                <LanguagesCard
                    languagesRows={[secondaryRow]}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onClickSetDefault={jest.fn()}
                    onClickDelete={jest.fn()}
                />,
            )

            const user = await openActionsMenu()
            await user.click(
                await screen.findByRole('menuitem', { name: /^delete$/i }),
            )

            expect(await screen.findByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Delete French')).toBeInTheDocument()
        })

        it('should call onClickDelete with the language when delete is confirmed in the modal', async () => {
            const onClickDelete = jest.fn()

            render(
                <LanguagesCard
                    languagesRows={[secondaryRow]}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onClickSetDefault={jest.fn()}
                    onClickDelete={onClickDelete}
                />,
            )

            const user = await openActionsMenu()
            await user.click(
                await screen.findByRole('menuitem', { name: /^delete$/i }),
            )

            const dialog = await screen.findByRole('dialog')
            await user.click(
                within(dialog).getByRole('button', { name: /^delete$/i }),
            )

            expect(onClickDelete).toHaveBeenCalledWith(
                secondaryRow,
                expect.any(Function),
            )
        })

        it('should close the modal without calling onClickDelete when Keep Language is clicked', async () => {
            const onClickDelete = jest.fn()

            render(
                <LanguagesCard
                    languagesRows={[secondaryRow]}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onClickSetDefault={jest.fn()}
                    onClickDelete={onClickDelete}
                />,
            )

            const user = await openActionsMenu()
            await user.click(
                await screen.findByRole('menuitem', { name: /^delete$/i }),
            )
            await user.click(
                screen.getByRole('button', { name: /keep language/i }),
            )

            expect(onClickDelete).not.toHaveBeenCalled()
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    describe('loading state', () => {
        it('should disable action buttons when update is pending', () => {
            render(
                <LanguagesCard
                    languagesRows={[secondaryRow]}
                    isUpdatePending={true}
                    isOneClickInstallation={undefined}
                    onClickSetDefault={jest.fn()}
                    onClickDelete={jest.fn()}
                />,
            )

            expect(
                screen.getByRole('button', { name: /customize/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /more actions/i }),
            ).toBeDisabled()
        })
    })

    describe('delete pending flow', () => {
        it('should keep the modal open after confirming delete before onSuccess is called', async () => {
            const onClickDelete = jest.fn()

            render(
                <LanguagesCard
                    languagesRows={[secondaryRow]}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onClickSetDefault={jest.fn()}
                    onClickDelete={onClickDelete}
                />,
            )

            const user = await openActionsMenu()
            await user.click(
                await screen.findByRole('menuitem', { name: /^delete$/i }),
            )
            const dialog = await screen.findByRole('dialog')
            await user.click(
                within(dialog).getByRole('button', { name: /^delete$/i }),
            )

            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        it('should close the modal once onSuccess is called', async () => {
            const onClickDelete = jest.fn((_language, onSuccess) => onSuccess())

            render(
                <LanguagesCard
                    languagesRows={[secondaryRow]}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onClickSetDefault={jest.fn()}
                    onClickDelete={onClickDelete}
                />,
            )

            const user = await openActionsMenu()
            await user.click(
                await screen.findByRole('menuitem', { name: /^delete$/i }),
            )
            const dialog = await screen.findByRole('dialog')
            await user.click(
                within(dialog).getByRole('button', { name: /^delete$/i }),
            )

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    describe('set default flow', () => {
        it('should call onClickSetDefault when Make default language is clicked', async () => {
            const onClickSetDefault = jest.fn()

            render(
                <LanguagesCard
                    languagesRows={[secondaryRow]}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onClickSetDefault={onClickSetDefault}
                    onClickDelete={jest.fn()}
                />,
            )

            const user = await openActionsMenu()
            await user.click(
                await screen.findByRole('menuitem', {
                    name: /make default language/i,
                }),
            )

            expect(onClickSetDefault).toHaveBeenCalledWith(secondaryRow)
        })
    })
})
