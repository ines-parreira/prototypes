import type { Theme } from 'reapop'
import { STATUSES, wyboTheme } from 'reapop'

const colors = {
    [STATUSES.info]: 'var(--border-accent-default)',
    [STATUSES.success]: 'var(--border-success-default)',
    [STATUSES.error]: 'var(--border-error-default)',
    [STATUSES.warning]: 'var(--border-warning-default)',
    [STATUSES.loading]: 'var(--border-neutral-tertiary)',
}

const primaryStyles = {
    background: 'var(--surface-button-secondary)',
    border: '1px solid',
    borderColor: 'var(--border-neutral-tertiary)',
    borderRadius: 'var(--spacing-xs)',
    color: 'var(--content-neutral-default)',
    padding: '1px 8px',
}

export const createNotificationsTheme = (): Theme => {
    return {
        ...wyboTheme,
        container: (position, singleContainer) => ({
            ...wyboTheme.container(position, singleContainer),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
        }),
        notification: (notification) => ({
            ...wyboTheme.notification(notification),
            backgroundColor: 'var(--elevation-neutral-default)',
            width: 'auto',
            minWidth: 320,
            maxWidth: 680,
            minHeight: 52,
            borderRadius: 'var(--spacing-xs)',
            display: 'inline-flex',
            alignItems: 'center',
            border: '1px solid',
            borderColor:
                colors[notification.status as keyof typeof colors] ??
                colors[STATUSES.info],
            borderLeftWidth: 4,
            paddingRight: 16,
            zIndex: 1100,
            pointerEvents: 'auto', // Ensure links inside are clickable
        }),
        notificationIcon: (__notification) => ({
            marginLeft: 16,
        }),
        notificationTitle: (notification) => ({
            ...wyboTheme.notificationTitle(notification),
            color: 'var(--content-neutral-default)',
            marginBottom: 4,
            fontWeight: 600,
            lineHeight: '20px',
        }),
        notificationMeta: (notification) => ({
            ...wyboTheme.notificationMeta(notification),
            padding: '16px 8px 16px 16px',
        }),
        notificationMessage: (notification) => ({
            ...wyboTheme.notificationMessage(notification),
            color: 'var(--content-neutral-default)',
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.01em',
        }),
        notificationButtons: (__notification) => ({
            order: 1,
            padding: '4px 0',
            display: 'flex',
        }),
        notificationButton: (notification, position) => {
            const isButtonPrimary = notification.buttons[position].primary

            const buttonColor = 'var(--content-neutral-default)'

            return {
                background: 'none',
                border: 'none',
                lineHeight: 1,
                padding: '0 8px',
                outline: 'none',
                marginLeft: 8,
                color: buttonColor,
                ...(isButtonPrimary && primaryStyles),
            }
        },
        notificationButtonText: () => ({
            fontSize: 12,
            fontWeight: 500,
            lineHeight: '20px',
            verticalAlign: 'middle',
        }),
        notificationDismissIcon: (notification) => ({
            ...wyboTheme.notificationDismissIcon(notification),
            order: 2,
            margin: '0px 8px',
            height: 11,
            width: 11,
            color: 'var(--content-neutral-secondary)',
        }),
    }
}

const theme: Theme = createNotificationsTheme()

export default theme
