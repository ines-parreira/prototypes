import React from 'react'

import RuleTableRow from './RuleTableRow'

const RuleTable = ({rules, schemas, actions}) => (
    <table className="ui selectable very basic padded table">
        <thead>
            <tr>
                <th>Details</th>
                <th>Updated</th>
            </tr>
        </thead>
        {
            rules.map((rule, index) =>
                <RuleTableRow
                    key={index}
                    index={index}
                    rule={rule}
                    schemas={schemas}
                    actions={actions}
                />
            )
        }
    </table>
)

export default RuleTable
