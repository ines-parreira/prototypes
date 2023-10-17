import {createContext} from 'react'

import useThemeContext from './useThemeContext'

export default createContext<ReturnType<typeof useThemeContext> | null>(null)
