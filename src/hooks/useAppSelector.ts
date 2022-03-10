// eslint-disable-next-line no-restricted-imports
import {useSelector} from 'react-redux'

import {RootState} from 'state/types'

const useAppSelector = <T>(
    selector: (state: RootState) => T,
    equalityFn?: (left: T, right: T) => boolean
) => useSelector<RootState, T>(selector, equalityFn)

export default useAppSelector
