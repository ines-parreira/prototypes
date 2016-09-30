import React from 'react'

const UnknownSyntax = ({ type }) => (
    <div className="unknownstatement ui red label">
        Unknown {type}
    </div>
)

UnknownSyntax.propTypes = {
    type: React.PropTypes.string.isRequired,
}

export default UnknownSyntax
