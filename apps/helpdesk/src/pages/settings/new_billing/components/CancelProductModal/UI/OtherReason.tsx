import TextArea from 'pages/common/forms/TextArea'

import Instruction from './Instruction'

import css from './OtherReason.less'

type OtherReasonProps = {
    isRequired: boolean
    currentReason: string | null
    handleOtherReasonChange: (nextValue: string) => void
}
const OtherReason = ({
    isRequired,
    currentReason,
    handleOtherReasonChange,
}: OtherReasonProps) => {
    return (
        <div className={css.otherReasonContainer}>
            <Instruction isRequired={isRequired}>
                Please share any additional details
            </Instruction>
            <TextArea
                placeholder="It didn't work out for me because..."
                value={currentReason || ''}
                onChange={handleOtherReasonChange}
            />
        </div>
    )
}

export default OtherReason
