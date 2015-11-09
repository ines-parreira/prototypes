import React from 'react'

class UnknownSyntax extends React.Component {
    render() {
        const { type } = this.props

        return (
            <div className="unknownstatement ui red label">
                Unknown { type }
            </div>
        )
    }
}

export default UnknownSyntax