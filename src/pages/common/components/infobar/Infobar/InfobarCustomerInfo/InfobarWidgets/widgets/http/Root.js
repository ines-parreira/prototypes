// @flow
import React, {type Node} from 'react'

import logo from '../../../../../../../../../../img/integrations/http.png'
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
                alt="HTTP"
            />
            <CardHeaderTitle>HTTP</CardHeaderTitle>
            {children}
        </>
    )
}
