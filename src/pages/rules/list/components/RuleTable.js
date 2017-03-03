import React, {PropTypes} from 'react'

import RuleTableRow from './RuleTableRow'

const RuleTable = ({actions, rules}) => (
    <table className="main-table view-table">
        <thead>
            <tr>
                <td className="cell-wrapper cell-short"><div><span>Details</span></div></td>
                <td className="cell-wrapper cell-short"><div><span>Status</span></div></td>
                {/*  <td className="cell-wrapper cell-short"><div><span>Usage</span></div></td> */}
                <td className="cell-wrapper cell-short"><div><span>Updated</span></div></td>
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
