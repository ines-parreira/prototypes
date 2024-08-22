import React, {ComponentProps, CSSProperties} from 'react'
import {DropdownMenu} from 'reactstrap'

type Props = ComponentProps<typeof DropdownMenu> & {
    style?: CSSProperties
}

export default function TagDropdownMenu({container, ...props}: Props) {
    return (
        <DropdownMenu
            {...props}
            container={container ?? undefined}
            style={{
                padding: 0,
                maxHeight: '400px',
                ...props.style,
                width: 'auto',
                minWidth: `${230 / 14}em`,
                maxWidth: `${400 / 14}em`,
                zIndex: 1051,
                overflow: 'auto',
            }}
        />
    )
}
