// @flow
import React, {type Node} from 'react'

import logo from '../../../../../../../../../../img/infobar/chat.svg'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'

export default function Root() {
    return {
        TitleWrapper,
    }
}

type Props = {
    children: Node,
}

export function TitleWrapper({children}: Props) {
    return (
        <>
            <CardHeaderIcon
                src={logo}
                alt="Chat"
            />
            <CardHeaderTitle>{children}</CardHeaderTitle>
        </>
    )
}
