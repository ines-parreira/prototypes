import { useDispatch } from 'react-redux'

import type { StoreDispatch } from '../state/types'

const useAppDispatch = () => useDispatch<StoreDispatch>()

export default useAppDispatch
