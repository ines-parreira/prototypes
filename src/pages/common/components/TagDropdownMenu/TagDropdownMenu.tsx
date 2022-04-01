import React, {ComponentProps, CSSProperties} from 'react'
import {DropdownMenu} from 'reactstrap'

type Props = ComponentProps<typeof DropdownMenu> & {
    style?: CSSProperties
}

export default function TagDropdownMenu(props: Props) {
    return (
        <DropdownMenu
            {...props}
            style={{
                padding: 0,
                ...props.style,
                width: 'auto',
                minWidth: `${230 / 14}em`,
                maxWidth: `${480 / 14}em`,
            }}
        />
    )
}
