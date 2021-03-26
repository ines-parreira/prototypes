import React from 'react'

type Props = {
    index: number
    onClick: (index: number) => void
}

export default class RemoveCallExpression extends React.Component<Props> {
    render() {
        const {index, onClick} = this.props

        return (
            <i
                className="material-icons text-danger clickable"
                onClick={() => onClick(index)}
            >
                clear
            </i>
        )
    }
}
