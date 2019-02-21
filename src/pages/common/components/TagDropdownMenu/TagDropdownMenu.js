// @flow
import classNames from 'classnames'
import React from 'react'
import {DropdownMenu} from 'reactstrap'
import _omit from 'lodash/omit'

import css from './TagDropdownMenu.less'

type Props = {
    wide?: true,
    className?: string
}

export default function TagDropdownMenu(props: Props) {
    return (
        <DropdownMenu
            {..._omit(props, 'wide')}
            className={classNames(css.dropdown, {
                [css.wide]: props.wide
            }, props.className)}
        />
    )
}
