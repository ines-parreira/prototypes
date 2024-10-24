import {Dispatch, useCallback, useReducer} from 'react'

import {
    EmbedMode,
    PageEmbedmentFormValueStateWithError,
    PageEmbedmentPosition,
    SelectedPage,
    EmbeddablePage,
} from './types'

export type PageEmbedmentFormReducerState = {
    embedMode: EmbedMode
    pageName: PageEmbedmentFormValueStateWithError
    pageSlug: PageEmbedmentFormValueStateWithError
    selectedPage: SelectedPage
    pagePosition: PageEmbedmentPosition
    isSlugTouched: boolean
}

export const DEFAULT_VALUES: PageEmbedmentFormReducerState = {
    embedMode: EmbedMode.NEW_PAGE,
    pageName: {
        value: '',
        error: '',
    },
    pageSlug: {
        value: '',
        error: '',
    },
    selectedPage: {
        external_id: '',
        title: '',
    },
    isSlugTouched: false,
    pagePosition: PageEmbedmentPosition.TOP,
}

type PageEmbedmentFormReducerActions =
    | {
          type: 'setEmbedMode'
          payload: EmbedMode
      }
    | {
          type: 'setPageName'
          payload: PageEmbedmentFormValueStateWithError
      }
    | {
          type: 'setPageSlug'
          payload: PageEmbedmentFormValueStateWithError
      }
    | {
          type: 'setSelectedPage'
          payload: EmbeddablePage
      }
    | {
          type: 'setPagePosition'
          payload: PageEmbedmentPosition
      }
    | {type: 'reset'}

export const pageEmbedmentFormReducer = (
    state: PageEmbedmentFormReducerState,
    action: PageEmbedmentFormReducerActions
): PageEmbedmentFormReducerState => {
    switch (action.type) {
        case 'reset':
            return DEFAULT_VALUES
        case 'setEmbedMode':
            return {
                ...state,
                embedMode: action.payload,
            }
        case 'setPageName':
            return {
                ...state,
                pageName: action.payload,
            }
        case 'setPageSlug':
            return {
                ...state,
                isSlugTouched:
                    action.payload.value === ''
                        ? // If the slug is empty, we don't want to mark it as touched
                          false
                        : (action.payload.isTouched ?? state.isSlugTouched),
                pageSlug: action.payload,
            }
        case 'setSelectedPage':
            return {
                ...state,
                selectedPage: action.payload,
            }
        case 'setPagePosition':
            return {
                ...state,
                pagePosition: action.payload,
            }
        default:
            throw new Error('unknown pageEmbedmentFormReducer action type')
    }
}

/**
 * This hook must be used by any components that want to use the page embedment form component.
 * This way, you can access the state of the form and dispatch actions to update it.
 */
export const usePageEmbedmentForm = (
    reducer = pageEmbedmentFormReducer,
    defaultValues = DEFAULT_VALUES
) => {
    const [state, dispatch] = useReducer(reducer, defaultValues)

    const reset = useCallback(() => dispatch({type: 'reset'}), [dispatch])

    const isPristine = state === defaultValues

    return {state, dispatch, reset, isPristine}
}

export type PageEmbedmentFormReducerDispatch =
    Dispatch<PageEmbedmentFormReducerActions>
