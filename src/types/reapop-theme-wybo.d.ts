declare module 'reapop-theme-wybo' {
    type ThemeClassName = {
        className: {
            main: string
            buttons: (count: number) => string
        } & Record<string, string>
    }

    type Theme = {
        notificationsContainer: ThemeClassName
        notification: ThemeClassName
    }

    const reapopThemeWybo: Theme
    export = reapopThemeWybo
}
