import {produce} from 'immer'
import {set as _set} from 'lodash'
import {useCallback, useState} from 'react'

export function useImmerState<T extends Record<string, unknown>>(
    initialState: T
) {
    const [actionState, setActionState] = useState(initialState)
    const produceActionState = useCallback(
        (path: string, value: any) =>
            setActionState((previousActionState) =>
                produce(previousActionState, (draft) => {
                    _set(draft, path, value)
                })
            ),
        []
    )
    return [actionState, produceActionState] as const
}
