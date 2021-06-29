// eslint-disable-next-line no-restricted-imports
import {useDispatch} from 'react-redux'

import {StoreDispatch} from '../state/types'

const useAppDispatch = () => useDispatch<StoreDispatch>()

export default useAppDispatch
