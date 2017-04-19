import React, {PropTypes} from 'react'

import {connect} from 'react-redux'
import Select from './Select'

const StatusSelect = ({onChange, schemas, value}) => {
    const options = schemas.getIn([
        'definitions', 'Ticket', 'properties', 'status', 'meta', 'enum'
    ]).toList()

    return (
        <Select
            value={value}
            onChange={onChange}
            options={options}
        />
    )
}

StatusSelect.propTypes = {
    actions: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    schemas: PropTypes.object,
    value: PropTypes.string,
}

const mapStateToProps = (state) => ({
    schemas: state.schemas,
})

export default connect(mapStateToProps)(StatusSelect)
