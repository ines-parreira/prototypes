import { useCallback, useState } from 'react'

import { produce } from 'immer'

import { setActionPathValue } from '../helpers/path'

export function useImmerState<T extends Record<string, unknown>>(
    initialState: T,
) {
    const [actionState, setActionState] = useState(initialState)
    const produceActionState = useCallback(
        (path: string, value: any) =>
            setActionState((previousActionState) =>
                produce(previousActionState, (draft) => {
                    setActionPathValue(draft, path, value)
                }),
            ),
        [],
    )
    return [actionState, produceActionState] as const
}
