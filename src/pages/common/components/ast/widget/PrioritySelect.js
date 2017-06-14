import React, {PropTypes} from 'react'

import {connect} from 'react-redux'
import Select from './Select'

const PrioritySelect = ({onChange, schemas, value}) => {
    const options = schemas.getIn([
        'definitions', 'Ticket', 'properties', 'priority', 'meta', 'enum'
    ]).toList()

    return (
        <Select
            value={value}
            onChange={onChange}
            options={options}
        />
    )
}

PrioritySelect.propTypes = {
    actions: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    schemas: PropTypes.object,
    value: PropTypes.string,
}

const mapStateToProps = (state) => ({
    schemas: state.schemas,
})

export default connect(
    mapStateToProps,
)(PrioritySelect)
