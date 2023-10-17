import {useState} from 'react'

import {Theme} from './types'

export default function useThemeContext() {
    return useState<Theme>('modern')
}
