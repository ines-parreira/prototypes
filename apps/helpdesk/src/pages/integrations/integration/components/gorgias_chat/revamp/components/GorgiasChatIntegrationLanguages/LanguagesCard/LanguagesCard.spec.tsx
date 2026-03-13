import type React from 'react'

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Language } from 'constants/languages'

import { LanguagesCard } from './LanguagesCard'

const mockPush = jest.fn()

jest.mock('@gorgias/axiom', () => ({
    Box: ({ children, ...rest }: { children: React.ReactNode }) => (
        <div {...rest}>{children}</div>
    ),
    Button: ({
        children,
        onClick,
        'aria-label': ariaLabel,
        isDisabled,
    }: {
        children?: React.ReactNode
        onClick?: () => void
        'aria-label'?: string
        isDisabled?: boolean
    }) => (
        <button onClick={onClick} aria-label={ariaLabel} disabled={isDisabled}>
            {children}
        </button>
    ),
    ButtonAs: { Button: 'button' },
    ButtonIntent: { Regular: 'regular', Destructive: 'destructive' },
    ButtonSize: { Sm: 'sm', Md: 'md' },
    ButtonVariant: {
        Secondary: 'secondary',
        Tertiary: 'tertiary',
        Primary: 'primary',
    },
    Card: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
    }) => <div className={className}>{children}</div>,
    Elevation: { Mid: 'mid' },
    Icon: ({ name }: { name: string }) => <span data-icon={name} />,
    IconName: {
        ArrowDown: 'arrow-down',
        DotsMeatballsHorizontal: 'dots-meatballs-horizontal',
    },
    IconSize: { Xs: 'xs' },
    Menu: ({
        trigger,
        children,
    }: {
        trigger: React.ReactNode
        children: React.ReactNode
    }) => (
        <div>
            {trigger}
            {children}
        </div>
    ),
    MenuItem: ({
        label,
        onAction,
    }: {
        label: string
        onAction: () => void
    }) => <button onClick={onAction}>{label}</button>,
    MenuSection: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    Modal: ({
        children,
        isOpen,
    }: {
        children: React.ReactNode
        isOpen: boolean
        onOpenChange: (isOpen: boolean) => void
    }) => (isOpen ? <div role="dialog">{children}</div> : null),
    ModalSize: { Md: 'md' },
    OverlayContent: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    OverlayFooter: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    OverlayHeader: ({ title }: { title: string }) => <div>{title}</div>,
    Tag: ({ children }: { children: React.ReactNode }) => (
        <span>{children}</span>
    ),
    TagColor: { Purple: 'purple' },
    TagSize: { Sm: 'sm' },
    Text: ({ children }: { children: React.ReactNode }) => (
        <span>{children}</span>
    ),
    TextSize: { Md: 'md', Sm: 'sm' },
    TextVariant: { Medium: 'medium' },
}))

jest.mock('react-router-dom', () => ({
    useHistory: () => ({ push: mockPush }),
}))

const primaryRow = {
    language: Language.EnglishUs,
    label: 'English - US',
    link: '/app/settings/channels/gorgias-chat/1/languages/en-US',
    primary: true,
    showActions: true,
}

const secondaryRow = {
    language: Language.French,
    label: 'French',
    link: '/app/settings/channels/gorgias-chat/1/languages/fr',
    primary: false,
    showActions: true,
}

beforeEach(() => {
    mockPush.mockClear()
})

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
            const user = userEvent.setup()

            render(
                <LanguagesCard
                    languagesRows={[secondaryRow]}
                    isUpdatePending={false}
                    isOneClickInstallation={undefined}
                    onClickSetDefault={jest.fn()}
                    onClickDelete={jest.fn()}
                />,
            )

            await user.click(screen.getByRole('button', { name: /^delete$/i }))

            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Delete French')).toBeInTheDocument()
        })

        it('should call onClickDelete with the language when delete is confirmed in the modal', async () => {
            const user = userEvent.setup()
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

            await user.click(screen.getByRole('button', { name: /^delete$/i }))

            const dialog = screen.getByRole('dialog')
            await user.click(
                within(dialog).getByRole('button', { name: /^delete$/i }),
            )

            expect(onClickDelete).toHaveBeenCalledWith(
                secondaryRow,
                expect.any(Function),
            )
        })

        it('should close the modal without calling onClickDelete when Keep Language is clicked', async () => {
            const user = userEvent.setup()
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

            await user.click(screen.getByRole('button', { name: /^delete$/i }))
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
            const user = userEvent.setup()
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

            await user.click(screen.getByRole('button', { name: /^delete$/i }))
            const dialog = screen.getByRole('dialog')
            await user.click(
                within(dialog).getByRole('button', { name: /^delete$/i }),
            )

            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        it('should close the modal once onSuccess is called', async () => {
            const user = userEvent.setup()
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

            await user.click(screen.getByRole('button', { name: /^delete$/i }))
            const dialog = screen.getByRole('dialog')
            await user.click(
                within(dialog).getByRole('button', { name: /^delete$/i }),
            )

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    describe('set default flow', () => {
        it('should call onClickSetDefault when Make default language is clicked', async () => {
            const user = userEvent.setup()
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

            await user.click(
                screen.getByRole('button', { name: /make default language/i }),
            )

            expect(onClickSetDefault).toHaveBeenCalledWith(secondaryRow)
        })
    })
})
