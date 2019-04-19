// @flow
import React from 'react'
import {DropdownMenu} from 'reactstrap'

type Props = {
    style?: {}
}

export default function TagDropdownMenu(props: Props) {
    return (
        <DropdownMenu
            {...props}
            style={{
                ...props.style,
                width: 'auto',
                minWidth: `${230/14}em`,
                maxWidth: `${480/14}em`
            }}
        />
    )
}
