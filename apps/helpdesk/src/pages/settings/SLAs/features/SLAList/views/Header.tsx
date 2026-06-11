import settingsCss from 'pages/settings/settings.less'

import css from './Header.less'

export function Header() {
    return (
        <div className={settingsCss.pageContainer}>
            <h1 className={css.heading}>Service level agreements</h1>
            <p className={css.infoText}>
                SLAs (service level agreements) set first response and
                resolution time targets for your support team. Policies are
                evaluated from top to bottom so the first policy that matches a
                ticket will apply. Drag to reorder priorities.
            </p>
            <p className={settingsCss.mb0}>
                Make sure your last policy has no conditions so it acts as a
                catch-all for tickets that don&apos;t match any specific policy.
            </p>
        </div>
    )
}
