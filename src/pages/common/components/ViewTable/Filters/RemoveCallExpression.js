import React, {PropTypes} from 'react'

export default class RemoveCallExpression extends React.Component {
    static propTypes = {
        index: PropTypes.number.isRequired,
        onClick: PropTypes.func.isRequired,
    }

    render() {
        const {index, onClick} = this.props

        return (
            <i
                className="fa fa-fw fa-times text-danger remove clickable"
                onClick={() => onClick(index)}
            />
        )
    }
}
