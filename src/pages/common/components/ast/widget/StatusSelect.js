import React from 'react'

import {connect} from 'react-redux'

import Select from './ReactSelect'

type Props = {
    actions: ?Object,
    onChange: () => void,
    schemas: ?Object,
    value: ?string,
    className: ?string,
}

class StatusSelect extends React.Component<Props> {
    render() {
        const {onChange, schemas, value, className} = this.props

        const options = schemas
            .getIn([
                'definitions',
                'Ticket',
                'properties',
                'status',
                'meta',
                'enum',
            ])
            .toList()
            .toJS()

        return (
            <Select
                className={className}
                value={value}
                onChange={onChange}
                options={options}
            />
        )
    }
}

const mapStateToProps = (state) => ({
    schemas: state.schemas,
})

export default connect(mapStateToProps)(StatusSelect)
