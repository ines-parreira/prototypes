import React, {PropTypes} from 'react'

import RuleTableRow from './RuleTableRow'

const RuleTable = ({actions, currentUser, rules, schemas}) => (
    <table className="ui selectable basic padded table">
        <thead>
            <tr>
                <th>Details</th>
                <th>Updated</th>
            </tr>
        </thead>
        {
            rules.map((rule, index) =>
                <RuleTableRow
                    actions={actions}
                    currentUser={currentUser}
                    key={index}
                    index={index}
                    rule={rule}
                    schemas={schemas}
                />
            )
        }
    </table>
)

RuleTable.propTypes = {
    actions: PropTypes.object.isRequired,
    currentUser: PropTypes.object,
    rules: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
}

export default RuleTable
