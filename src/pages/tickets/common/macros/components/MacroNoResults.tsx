import React from 'react'
import {Button} from 'reactstrap'

type Props = {
    searchQuery: string
    newAction: () => void
}

const MacroNoResults = ({searchQuery, newAction}: Props) => {
    return (
        <div className="no-result-container">
            <p>
                {!!searchQuery ? (
                    <span>No macros found</span>
                ) : (
                    <span>You don't have any macros yet</span>
                )}
            </p>
            <Button type="button" color="info" onClick={newAction}>
                <i className="material-icons mr-2">add</i>
                Create a new macro
            </Button>
        </div>
    )
}

MacroNoResults.displayName = 'MacroNoResults'

export default MacroNoResults
