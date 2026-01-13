import { useReducer } from 'react'

import type { SupportedCategories } from '../../types'

type WizardState =
    | { step: 'categories'; selectedCategory: null }
    | { step: 'metafields'; selectedCategory: SupportedCategories }

type WizardAction =
    | { type: 'SELECT_CATEGORY'; category: SupportedCategories }
    | { type: 'BACK_TO_CATEGORIES' }
    | { type: 'RESET' }

const initialState: WizardState = {
    step: 'categories',
    selectedCategory: null,
}

export function wizardReducer(
    state: WizardState,
    action: WizardAction,
): WizardState {
    switch (action.type) {
        case 'SELECT_CATEGORY':
            return {
                step: 'metafields',
                selectedCategory: action.category,
            }
        case 'BACK_TO_CATEGORIES':
        case 'RESET':
            return initialState
        default:
            return state
    }
}

export function useImportWizard() {
    const [state, dispatch] = useReducer(wizardReducer, initialState)

    const selectCategory = (category: SupportedCategories) => {
        dispatch({ type: 'SELECT_CATEGORY', category })
    }

    const backToCategories = () => {
        dispatch({ type: 'BACK_TO_CATEGORIES' })
    }

    const reset = () => {
        dispatch({ type: 'RESET' })
    }

    return {
        step: state.step,
        selectedCategory: state.selectedCategory,
        selectCategory,
        backToCategories,
        reset,
    }
}
