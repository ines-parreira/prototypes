import React from 'react'

import {UserRole} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import {FetchMacrosOptions} from 'models/macro/types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {RootState} from 'state/types'
import {hasRole} from 'utils'

type Props = {
    searchParams: FetchMacrosOptions
    newAction: () => void
}

const MacroNoResults = ({searchParams, newAction}: Props) => {
    const currentUser = useAppSelector((state: RootState) => state.currentUser)
    const {search, languages, tags} = searchParams

    const hasSearch = !!search || languages?.length || tags?.length

    return (
        <div className="no-result-container">
            <p>
                {hasSearch ? (
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
