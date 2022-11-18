import React from 'react'
import classNames from 'classnames'
import {ListGroupItem} from 'reactstrap'

import css from './HomePageListGroupItem.less'

interface HomePageListGroupItemProps {
    children: React.ReactNode
    header?: boolean
    arrowRight?: boolean
}

const HomePageListGroupItem: React.FC<HomePageListGroupItemProps> = ({
    children,
    arrowRight,
    header = false,
}) => {
    return (
        <ListGroupItem className={classNames(css.button, header && css.header)}>
            {children}

            {arrowRight && (
                <span
                    className={classNames(
                        'material-icons-outlined',
                        css.chevronIcon
                    )}
                >
                    chevron_right
                </span>
            )}
        </ListGroupItem>
    )
}

export default HomePageListGroupItem
