import { useDispatch } from 'react-redux'

import { StoreDispatch } from '../state/types'

const useAppDispatch = () => useDispatch<StoreDispatch>()

export default useAppDispatch
