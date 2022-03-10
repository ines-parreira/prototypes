import React from 'react'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {RootState} from 'state/types'
import {hasRole} from 'utils'
import {UserRole} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'

type Props = {
    searchQuery: string
    newAction: () => void
}

const MacroNoResults = ({searchQuery, newAction}: Props) => {
    const currentUser = useAppSelector((state: RootState) => state.currentUser)

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
                <Button onClick={newAction}>
                    <ButtonIconLabel icon="add">
                        Create a new macro
                    </ButtonIconLabel>
                </Button>
            )}
        </div>
    )
}

MacroNoResults.displayName = 'MacroNoResults'

export default MacroNoResults
