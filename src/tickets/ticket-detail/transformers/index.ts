import type { Transformer } from '../types'
import { bareMessageTransformer } from './bareMessageTransformer'
import { messageTransformer } from './messageTransformer'

export const transformers: Transformer[] = [
    messageTransformer,
    bareMessageTransformer,
]
