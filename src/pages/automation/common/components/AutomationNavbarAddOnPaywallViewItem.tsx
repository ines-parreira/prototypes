import React, {ReactNode} from 'react'
import classnames from 'classnames'

import css from './AutomationNavbarAddOnPaywallViewItem.less'

type Props = {
    children: ReactNode
    isNested?: boolean
}

const AutomationNavbarAddOnPaywallViewItem = ({children, isNested}: Props) => {
    return (
        <span className={classnames(css.item, {[css.isNested]: isNested})}>
            {children}
            <i className={classnames('material-icons md-2', css.icon)}>lock</i>
        </span>
    )
}

export default AutomationNavbarAddOnPaywallViewItem
