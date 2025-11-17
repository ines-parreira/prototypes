import type { NonEmptyArray } from 'types'

export type InstructionTab = {
    id: string
    title: string
    instructions: string[]
    instructionAlert?: string
    code?: string
}

export type InstructionTabs = NonEmptyArray<InstructionTab>
