import React, {PropTypes} from 'react'

import RuleTableRow from './RuleTableRow'

const RuleTable = ({actions, rules}) => (
    <table className="ui selectable basic padded table">
        <thead>
            <tr>
                <th>Details</th>
                <th className="right aligned">Updated</th>
            </tr>
        </thead>
        {
            rules.map((rule, i) =>
                <RuleTableRow
                    actions={actions}
                    key={i}
                    rule={rule}
                />
            ).toList()
        }
    </table>
)

RuleTable.propTypes = {
    actions: PropTypes.object.isRequired,
    rules: PropTypes.object.isRequired,
}

export default RuleTable
