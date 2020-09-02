// @flow

import React from 'react'
import {UncontrolledTooltip} from 'reactstrap'

type Props = {
    isSystem: boolean,
    isAllowed: boolean,
}

export default function ViewSharingButtonTooltip({isSystem, isAllowed}: Props) {
    if (isSystem) {
        return (
            <UncontrolledTooltip target="view-sharing-button" placement="left">
                System views are not editable
            </UncontrolledTooltip>
        )
    }

    if (!isAllowed) {
        return (
            <UncontrolledTooltip target="view-sharing-button" placement="left">
                Only lead and admin agents can edit view's sharing options
            </UncontrolledTooltip>
        )
    }

    return null
}
