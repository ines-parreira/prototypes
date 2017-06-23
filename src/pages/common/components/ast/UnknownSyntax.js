import React from 'react'
import {Badge} from 'reactstrap'

const UnknownSyntax = ({type}) => (
    <Badge
        className="unknownstatement"
        color="danger"
    >
        Unknown {type}
    </Badge>
)

UnknownSyntax.propTypes = {
    type: React.PropTypes.string.isRequired,
}

export default UnknownSyntax
