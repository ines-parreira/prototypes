import React, {ReactNode} from 'react'
import css from './Instruction.less'

type InstructionProps = {
    children: ReactNode
    isRequired?: boolean
}
const Instruction = ({children, isRequired = false}: InstructionProps) => {
    return (
        <div className={css.instruction}>
            {children}
            {isRequired && <span>*</span>}
        </div>
    )
}

export default Instruction
