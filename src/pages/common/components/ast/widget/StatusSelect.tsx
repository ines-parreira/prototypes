import React from 'react'
import {List} from 'immutable'

import {connect, ConnectedProps} from 'react-redux'

import {RootState} from '../../../../../state/types'
import {TicketStatus} from '../../../../../business/types/ticket'

import Select from './ReactSelect'

type Props = {
    onChange: (value: TicketStatus) => void
    value: Maybe<string>
    className?: string
} & ConnectedProps<typeof connector>

function StatusSelect({onChange, schemas, value, className}: Props) {
    const options = (
        schemas.getIn([
            'definitions',
            'Ticket',
            'properties',
            'status',
            'meta',
            'enum',
        ]) as List<any>
    )
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

const connector = connect((state: RootState) => ({
    schemas: state.schemas,
}))

export default connector(StatusSelect)
