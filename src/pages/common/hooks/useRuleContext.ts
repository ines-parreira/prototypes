import { useContext } from 'react'

import { RuleContext } from './rule/RuleProvider'

export const useRuleContext = () => {
    const context = useContext(RuleContext)
    if (!context) {
        throw new Error(
            'useRuleContext must be used within a RuleContext.Provider',
        )
    }

    return context
}
