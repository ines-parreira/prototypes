import {Badge} from '@gorgias/merchant-ui-kit'
import React from 'react'

type Props = {
    type: string
}

const UnknownSyntax = ({type}: Props) => (
    <Badge className="unknownstatement" type={'error'}>
        Unknown {type}
    </Badge>
)

export default UnknownSyntax
