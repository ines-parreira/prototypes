import React from 'react'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

type Props = {
    type: string
}

const UnknownSyntax = ({type}: Props) => (
    <Badge className="unknownstatement" type={ColorType.Error}>
        Unknown {type}
    </Badge>
)

export default UnknownSyntax
