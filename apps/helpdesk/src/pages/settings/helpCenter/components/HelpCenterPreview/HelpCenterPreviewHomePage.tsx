import classnames from 'classnames'

import { HELP_CENTER_DEFAULT_LAYOUT } from '../../constants'
import HelpCenterPreviewDefaultHomePage from './HelpCenterPreviewDefaultHomePage'
import HelpCenterPreviewOnePagerHomePage from './HelpCenterPreviewOnePagerHomePage'

import css from './HelpCenterPreviewHomePage.less'

type HelpCenterPreviewHomePageProps = {
    layout: 'default' | '1-pager'
    primaryColor?: string
    primaryFont?: string
    searchPlaceholder?: string
    isSearchbar?: boolean
}

const HelpCenterPreviewHomePage = ({
    layout,
    primaryColor,
    primaryFont,
    searchPlaceholder,
    isSearchbar,
}: HelpCenterPreviewHomePageProps) => {
    const hasDefaultLayout = layout === HELP_CENTER_DEFAULT_LAYOUT
    return (
        <div
            className={classnames(css.container, {
                [css.onePagerLayout]: !hasDefaultLayout,
            })}
            style={
                // React `style` accept only css properties
                {
                    '--preview-primary-color': primaryColor,
                    '--preview-primary-font': primaryFont,
                } as React.CSSProperties
            }
        >
            {hasDefaultLayout ? (
                <HelpCenterPreviewDefaultHomePage
                    searchPlaceholder={searchPlaceholder}
                    isSearchbar={isSearchbar}
                />
            ) : (
                <HelpCenterPreviewOnePagerHomePage />
            )}
        </div>
    )
}

export default HelpCenterPreviewHomePage
