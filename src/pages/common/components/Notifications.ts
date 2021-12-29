import {wyboTheme, Theme, STATUSES} from 'reapop'

import colorTokens from 'assets/tokens/colors.json'

const colors = {
    [STATUSES.info]: colorTokens['📺 Classic'].Main.Primary.value,
    [STATUSES.success]: colorTokens['📺 Classic'].Feedback.Success.value,
    [STATUSES.error]: colorTokens['📺 Classic'].Feedback.Error.value,
    [STATUSES.warning]: colorTokens['📺 Classic'].Feedback.Warning.value,
    [STATUSES.loading]: colorTokens['📺 Classic'].Neutral.Grey_4.value,
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
    }),
    notificationIcon: () => ({
        marginLeft: 16,
    }),
    notificationTitle: (notification) => ({
        ...wyboTheme.notificationTitle(notification),
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
        color: colorTokens['📺 Classic'].Neutral.Grey_6.value,
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
                ? colorTokens['📺 Classic'].Main.Variations.Primary_2.value
                : state.isActive
                ? colorTokens['📺 Classic'].Main.Variations.Primary_3.value
                : colorTokens['📺 Classic'].Main.Primary.value,
            border: '1px solid',
            borderColor: state.isHovered
                ? colorTokens['📺 Classic'].Main.Primary.value
                : state.isActive
                ? colorTokens['📺 Classic'].Main.Variations.Primary_4.value
                : colorTokens['📺 Classic'].Main.Variations.Primary_3.value,
            borderRadius: 4,
            color: colorTokens['📺 Classic'].Neutral.Grey_0.value,
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
                ? colorTokens['📺 Classic'].Main.Variations.Primary_4.value
                : colorTokens['📺 Classic'].Main.Primary.value,
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
        color: colorTokens['📺 Classic'].Neutral.Grey_4.value,
    }),
}

export default theme
