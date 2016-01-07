import React, {PropTypes} from 'react'
import Statement from './Statement'
import Immutable from 'immutable'

export default class Program extends React.Component {
    render() {
        const { index, actions, body, schemas} = this.props
        return (
            <div className="program">
            {body.map((statement, idx) => {
                return (
                    <Statement
                        {...statement}
                        key={idx}
                        parent={Immutable.List(['body', idx])}
                        index={index}
                        schemas={schemas}
                        actions={actions} />
                )
            })}
            </div>
        )
    }
}

Program.propTypes = {
    index: PropTypes.number,
    schemas: PropTypes.object,
    actions: PropTypes.object,
    body: PropTypes.array
}
