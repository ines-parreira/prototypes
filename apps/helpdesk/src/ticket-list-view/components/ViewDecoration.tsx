import { systemViewIcons } from '@repo/tickets/utils/views'
import classnames from 'classnames'

import type { View } from 'models/view/types'
import { ViewCategory } from 'models/view/types'

import css from './ViewDecoration.less'

export default function ViewDecoration({ view }: { view: View | null }) {
    const viewEmoji = view?.decoration?.emoji
    const { category, slug } = view || {}
    const shouldDisplaySystemIcon = !!(
        slug &&
        category &&
        category === ViewCategory.System &&
        systemViewIcons[slug as keyof typeof systemViewIcons]
    )

    if (shouldDisplaySystemIcon) {
        return (
            <i className={classnames('material-icons', css.systemIcon)}>
                {systemViewIcons[slug as keyof typeof systemViewIcons]}
            </i>
        )
    }

    if (!!viewEmoji) {
        return <span className={css.emoji}>{viewEmoji}</span>
    }

    return null
}
