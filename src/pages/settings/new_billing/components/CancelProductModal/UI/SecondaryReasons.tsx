import React from 'react'

import RadioFieldSet from 'pages/common/forms/RadioFieldSet'

import Instruction from './Instruction'

import css from './SecondaryReasons.less'

type SecondaryReasonsProps = {
    secondaryReasons: string[]
    currentReason: string | null
    handleSecondaryReasonSelection: (secondaryReason: string) => void
}
const SecondaryReasons = ({
    secondaryReasons,
    currentReason,
    handleSecondaryReasonSelection,
}: SecondaryReasonsProps) => {
    const selectionOptions = secondaryReasons.map((secondaryReason) => ({
        label: secondaryReason,
        value: secondaryReason,
    }))
    return (
        <div className={css.secondaryReasonsContainer}>
            <Instruction isRequired>Could you please share more? </Instruction>
            <RadioFieldSet
                onChange={handleSecondaryReasonSelection}
                options={selectionOptions}
                selectedValue={currentReason || ''}
            />
        </div>
    )
}

export default SecondaryReasons
