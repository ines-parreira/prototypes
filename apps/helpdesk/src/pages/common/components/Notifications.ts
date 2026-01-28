import type { Theme } from 'reapop'
import { STATUSES, wyboTheme } from 'reapop'

const legacyColors = {
    [STATUSES.info]: 'var(--main-primary)',
    [STATUSES.success]: 'var(--feedback-success)',
    [STATUSES.error]: 'var(--feedback-error)',
    [STATUSES.warning]: 'var(--feedback-warning)',
    [STATUSES.loading]: 'var(--neutral-grey-4)',
}

const axiomColors = {
    [STATUSES.info]: 'var(--border-accent-default)',
    [STATUSES.success]: 'var(--border-success-primary)',
    [STATUSES.error]: 'var(--border-error-primary)',
    [STATUSES.warning]: 'var(--border-warning-default)',
    [STATUSES.loading]: 'var(--border-neutral-tertiary)',
}

export const createNotificationsTheme = (isAxiom: boolean): Theme => {
    const colors = isAxiom ? axiomColors : legacyColors

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
            backgroundColor: isAxiom
                ? 'var(--elevation-neutral-default)'
                : 'var(--neutral-grey-0)',
            width: 'auto',
            minWidth: 320,
            maxWidth: 680,
            minHeight: 52,
            borderRadius: isAxiom ? 'var(--spacing-xs)' : 4,
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
            color: isAxiom
                ? 'var(--content-neutral-default)'
                : 'var(--neutral-grey-6)',
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
            color: isAxiom
                ? 'var(--content-neutral-default)'
                : 'var(--neutral-grey-6)',
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.01em',
        }),
        notificationButtons: (__notification) => ({
            order: 1,
            padding: '4px 0',
            display: 'flex',
        }),
        notificationButton: (notification, position, state) => {
            const isButtonPrimary = notification.buttons[position].primary

            const legacyPrimaryStyles = {
                background: state.isHovered
                    ? 'var(--main-primary-2)'
                    : state.isActive
                      ? 'var(--main-primary-3)'
                      : 'var(--main-primary)',
                border: '1px solid',
                borderColor: state.isHovered
                    ? 'var(--main-primary)'
                    : state.isActive
                      ? 'var(--main-primary-4)'
                      : 'var(--main-primary-3)',
                borderRadius: 4,
                color: 'var(--neutral-grey-0)',
                padding: '1px 8px',
            }

            const axiomPrimaryStyles = {
                background: 'var(--surface-accent-default)',
                border: '1px solid',
                borderColor: 'var(--border-accent-default)',
                borderRadius: 'var(--spacing-xs)',
                color: 'var(--static-default-white)',
                padding: '1px 8px',
            }

            const primaryStyles = isAxiom
                ? axiomPrimaryStyles
                : legacyPrimaryStyles

            const buttonColor = isAxiom
                ? state.isHovered
                    ? 'var(--content-additional-blue)'
                    : 'var(--content-accent-default)'
                : state.isHovered
                  ? 'var(--main-primary-4)'
                  : 'var(--main-primary)'

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
        notificationButtonText: (__notification, __position, __state) => ({
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
            color: isAxiom
                ? 'var(--content-neutral-secondary)'
                : 'var(--neutral-grey-4)',
        }),
    }
}

// Default legacy theme export for backward compatibility
const theme: Theme = createNotificationsTheme(false)

export default theme
