import css from './InfobarNavigationDivider.less'

export function InfobarNavigationDivider() {
    return (
        <div
            role="separator"
            aria-orientation="horizontal"
            className={css.divider}
        />
    )
}
