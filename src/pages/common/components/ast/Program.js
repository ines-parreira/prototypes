import React, {PropTypes} from 'react'
import Statement from './statement/Statement'
import {List} from 'immutable'

export default class Program extends React.Component {
    componentDidMount() {
       $('.dropdown.button').dropdown()
    }
    render() {
        const {index, actions, body, schemas} = this.props
        return (
            <div className="Program">
            {body.map((statement, idx) => {
                return (
                    <Statement
                        {...statement}
                        key={idx}
                        parent={List(['body', idx])}
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
