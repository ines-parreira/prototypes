import React from 'react'
import {useSelector} from 'react-redux'
import {Button} from 'reactstrap'

import {RootState} from '../../../../../state/types'
import {hasRole} from '../../../../../utils'
import {UserRole} from '../../../../../config/types/user'

type Props = {
    searchQuery: string
    newAction: () => void
}

const MacroNoResults = ({searchQuery, newAction}: Props) => {
    const currentUser = useSelector((state: RootState) => state.currentUser)

    return (
        <div className="no-result-container">
            <p>
                {!!searchQuery ? (
                    <span>No macros found</span>
                ) : (
                    <span>You don't have any macros yet</span>
                )}
            </p>
            {hasRole(currentUser, UserRole.Agent) && (
                <Button type="button" color="info" onClick={newAction}>
                    <i className="material-icons mr-2">add</i>
                    Create a new macro
                </Button>
            )}
        </div>
    )
}

MacroNoResults.displayName = 'MacroNoResults'

export default MacroNoResults
