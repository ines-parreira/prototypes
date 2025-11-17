import type { Theme } from 'reapop'
import { STATUSES, wyboTheme } from 'reapop'

const colors = {
    [STATUSES.info]: 'var(--main-primary)',
    [STATUSES.success]: 'var(--feedback-success)',
    [STATUSES.error]: 'var(--feedback-error)',
    [STATUSES.warning]: 'var(--feedback-warning)',
    [STATUSES.loading]: 'var(--neutral-grey-4)',
}

const theme: Theme = {
    ...wyboTheme,
    container: (position, singleContainer) => ({
        ...wyboTheme.container(position, singleContainer),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
    }),
    notification: (notification) => ({
        ...wyboTheme.notification(notification),
        backgroundColor: 'var(--neutral-grey-0)',
        width: 'auto',
        minWidth: 320,
        maxWidth: 680,
        minHeight: 52,
        borderRadius: 4,
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid',
        borderColor:
            colors[notification.status as keyof typeof colors] ??
            colors[STATUSES.info],
        borderLeftWidth: 4,
        paddingRight: 16,
        zIndex: 1100, // Higher than the modal's z-index
    }),
    notificationIcon: () => ({
        marginLeft: 16,
    }),
    notificationTitle: (notification) => ({
        ...wyboTheme.notificationTitle(notification),
        color: 'var(--neutral-grey-6)',
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
        color: 'var(--neutral-grey-6)',
        fontSize: 14,
        lineHeight: '20px',
        letterSpacing: '-0.01em',
    }),
    notificationButtons: () => ({
        order: 1,
        padding: '4px 0',
        display: 'flex',
    }),
    notificationButton: (notification, position, state) => {
        const isButtonPrimary = notification.buttons[position].primary

        const primaryStyles = {
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

        return {
            background: 'none',
            border: 'none',
            lineHeight: 1,
            padding: '0 8px',
            outline: 'none',
            marginLeft: 8,
            color: state.isHovered
                ? 'var(--main-primary-4)'
                : 'var(--main-primary)',
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
        color: 'var(--neutral-grey-4)',
    }),
}

export default theme
