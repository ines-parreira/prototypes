import { useDesktopOnlyShowGlobalNavFeatureFlag } from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'

import css from './ViewTableHeaderContainer.less'

export function ViewTableHeaderContainer({
    children,
}: {
    children: React.ReactNode
}) {
    /* istanbul ignore next */
    const showGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()
    return (
        <div
            /* istanbul ignore next */
            className={showGlobalNav ? css.headerPadding : 'container-padding'}
        >
            {children}
        </div>
    )
}
