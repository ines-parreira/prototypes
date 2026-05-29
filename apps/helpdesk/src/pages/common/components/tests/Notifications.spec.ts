import { STATUSES } from 'reapop'

import theme, { createNotificationsTheme } from '../Notifications'

const mockNotification = {
    id: '1',
    status: STATUSES.info,
    title: 'Test',
    message: 'Test message',
    buttons: [],
}

describe('createNotificationsTheme', () => {
    const axiomTheme = createNotificationsTheme()

    it('should return a theme object with Axiom styles', () => {
        expect(axiomTheme).toBeDefined()
        expect(axiomTheme.container).toBeDefined()
        expect(axiomTheme.notification).toBeDefined()
    })

    it('should use Axiom notification shell styles', () => {
        const notificationStyles = axiomTheme.notification(
            mockNotification as any,
        )

        expect(notificationStyles.backgroundColor).toBe(
            'var(--elevation-neutral-default)',
        )
        expect(notificationStyles.borderColor).toBe(
            'var(--border-accent-default)',
        )
        expect(notificationStyles.borderRadius).toBe('var(--spacing-xs)')
        expect(notificationStyles.width).toBe('auto')
        expect(notificationStyles.minWidth).toBe(320)
        expect(notificationStyles.maxWidth).toBe(680)
        expect(notificationStyles.minHeight).toBe(52)
        expect(notificationStyles.display).toBe('inline-flex')
        expect(notificationStyles.alignItems).toBe('center')
        expect(notificationStyles.border).toBe('1px solid')
        expect(notificationStyles.borderLeftWidth).toBe(4)
        expect(notificationStyles.paddingRight).toBe(16)
        expect(notificationStyles.zIndex).toBe(1100)
        expect(notificationStyles.pointerEvents).toBe('auto')
    })

    it('should use Axiom content colors', () => {
        const titleStyles = axiomTheme.notificationTitle(
            mockNotification as any,
        )
        const messageStyles = axiomTheme.notificationMessage(
            mockNotification as any,
        )
        const dismissIconStyles = axiomTheme.notificationDismissIcon(
            mockNotification as any,
        )

        expect(titleStyles.color).toBe('var(--content-neutral-default)')
        expect(messageStyles.color).toBe('var(--content-neutral-default)')
        expect(dismissIconStyles.color).toBe('var(--content-neutral-secondary)')
    })

    it('should use correct Axiom colors for each status', () => {
        const statuses = [
            {
                status: STATUSES.info,
                color: 'var(--border-accent-default)',
            },
            {
                status: STATUSES.success,
                color: 'var(--border-success-primary)',
            },
            {
                status: STATUSES.error,
                color: 'var(--border-error-primary)',
            },
            {
                status: STATUSES.warning,
                color: 'var(--border-warning-default)',
            },
            {
                status: STATUSES.loading,
                color: 'var(--border-neutral-tertiary)',
            },
        ]

        statuses.forEach(({ status, color }) => {
            const notificationStyles = axiomTheme.notification({
                ...mockNotification,
                status,
            } as any)

            expect(notificationStyles.borderColor).toBe(color)
        })
    })

    it('should style notification buttons with Axiom colors', () => {
        const notificationWithPrimaryButton = {
            ...mockNotification,
            buttons: [{ primary: true, name: 'Confirm', onClick: () => {} }],
        }
        const notificationWithSecondaryButton = {
            ...mockNotification,
            buttons: [{ primary: false, name: 'Cancel', onClick: () => {} }],
        }

        const primaryButtonStyles = axiomTheme.notificationButton(
            notificationWithPrimaryButton as any,
            0,
            { isHovered: false, isActive: false },
        )
        const secondaryButtonStyles = axiomTheme.notificationButton(
            notificationWithSecondaryButton as any,
            0,
            { isHovered: false, isActive: false },
        )

        expect(primaryButtonStyles.background).toBe(
            'var(--surface-button-secondary)',
        )
        expect(primaryButtonStyles.borderColor).toBe(
            'var(--border-neutral-tertiary)',
        )
        expect(primaryButtonStyles.color).toBe('var(--content-neutral-default)')
        expect(primaryButtonStyles.borderRadius).toBe('var(--spacing-xs)')
        expect(secondaryButtonStyles.background).toBe('none')
        expect(secondaryButtonStyles.color).toBe(
            'var(--content-neutral-default)',
        )
    })

    it('should configure notification internals layout', () => {
        const iconStyles = axiomTheme.notificationIcon(mockNotification as any)
        const metaStyles = axiomTheme.notificationMeta(mockNotification as any)
        const buttonsStyles = axiomTheme.notificationButtons(
            mockNotification as any,
        )
        const buttonTextStyles = axiomTheme.notificationButtonText(
            mockNotification as any,
            0,
            { isHovered: false, isActive: false },
        )
        const dismissIconStyles = axiomTheme.notificationDismissIcon(
            mockNotification as any,
        )

        expect(iconStyles.marginLeft).toBe(16)
        expect(metaStyles.padding).toBe('16px 8px 16px 16px')
        expect(buttonsStyles.order).toBe(1)
        expect(buttonsStyles.padding).toBe('4px 0')
        expect(buttonsStyles.display).toBe('flex')
        expect(buttonTextStyles.fontSize).toBe(12)
        expect(buttonTextStyles.fontWeight).toBe(500)
        expect(buttonTextStyles.lineHeight).toBe('20px')
        expect(buttonTextStyles.verticalAlign).toBe('middle')
        expect(dismissIconStyles.order).toBe(2)
        expect(dismissIconStyles.margin).toBe('0px 8px')
        expect(dismissIconStyles.height).toBe(11)
        expect(dismissIconStyles.width).toBe(11)
    })

    it('should configure container with flex layout', () => {
        const containerStyles = axiomTheme.container('top-right', false)

        expect(containerStyles.display).toBe('flex')
        expect(containerStyles.flexDirection).toBe('column')
        expect(containerStyles.alignItems).toBe('flex-end')
    })

    it('should fallback to the info color for unknown statuses', () => {
        const notificationStyles = axiomTheme.notification({
            ...mockNotification,
            status: 'unknown-status',
        } as any)

        expect(notificationStyles.borderColor).toBe(
            'var(--border-accent-default)',
        )
    })
})

describe('Notifications theme default export', () => {
    it('should export the Axiom theme by default', () => {
        expect(theme).toBeDefined()

        const notificationStyles = theme.notification(mockNotification as any)

        expect(notificationStyles.backgroundColor).toBe(
            'var(--elevation-neutral-default)',
        )
        expect(notificationStyles.borderRadius).toBe('var(--spacing-xs)')
    })
})
