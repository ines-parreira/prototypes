import React, {ComponentProps, CSSProperties} from 'react'
import {DropdownMenu} from 'reactstrap'

import {useAppNode} from 'appNode'

type Props = ComponentProps<typeof DropdownMenu> & {
    style?: CSSProperties
}

export default function TagDropdownMenu(props: Props) {
    const appNode = useAppNode()

    return (
        <DropdownMenu
            {...props}
            container={appNode ?? undefined}
            style={{
                padding: 0,
                ...props.style,
                width: 'auto',
                minWidth: `${230 / 14}em`,
                maxWidth: `${400 / 14}em`,
                zIndex: 1051,
            }}
        />
    )
}
