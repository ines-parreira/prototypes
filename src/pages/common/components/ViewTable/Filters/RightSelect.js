import React, {PropTypes} from 'react'
import {Input} from 'reactstrap'

export default class RightSelect extends React.Component {
    static propTypes = {
        node: PropTypes.object.isRequired,
        options: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        onChange: PropTypes.func.isRequired
    }

    render() {
        const {node, options, onChange} = this.props

        return (
            <Input
                className="d-inline"
                style={{width: 'auto'}}
                type="select"
                value={node.value}
                onChange={e => onChange(this.props.index, e.target.value)}
            >
                {
                    options.map((option, index) => (
                        <option
                            key={index}
                            value={option.get('id')}
                        >
                            {option.get('name')}
                        </option>
                    ))
                }
            </Input>
        )
    }
}
