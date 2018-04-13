// @flow
import React from 'react'
import {Badge} from 'reactstrap'

type Props = {
    type: string
}

const UnknownSyntax = ({type}: Props) => (
    <Badge
        className="unknownstatement"
        color="danger"
    >
        Unknown {type}
    </Badge>
)

export default UnknownSyntax
