import { LegacyButton as Button } from '@gorgias/axiom'

import { UserRole } from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import type { Filters } from 'models/macro/types'
import type { RootState } from 'state/types'
import { hasRole } from 'utils'

type Props = {
    searchParams: Filters
    newAction: () => void
}

const MacroNoResults = ({ searchParams, newAction }: Props) => {
    const currentUser = useAppSelector((state: RootState) => state.currentUser)
    const { search, languages, tags } = searchParams

    const hasSearch = !!search || languages?.length || tags?.length

    return (
        <div className="no-result-container">
            <p>
                {hasSearch ? (
                    <span>No macros found</span>
                ) : (
                    <span>{`You don't have any macros yet`}</span>
                )}
            </p>
            {hasRole(currentUser, UserRole.Agent) && (
                <Button onClick={newAction} leadingIcon="add">
                    Create a new macro
                </Button>
            )}
        </div>
    )
}

export default MacroNoResults
