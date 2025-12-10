import TextArea from 'pages/common/forms/TextArea'

import Instruction from './Instruction'

import css from './AdditionalDetails.less'

type AdditionalDetailsProps = {
    currentDetails: string | null
    handleAdditionalDetailsChange: (nextValue: string) => void
}
const AdditionalDetails = ({
    currentDetails,
    handleAdditionalDetailsChange,
}: AdditionalDetailsProps) => {
    return (
        <div className={css.additionalDetailsContainer}>
            <Instruction isRequired={false}>
                Please share any additional details
            </Instruction>
            <TextArea
                placeholder="It didn't work out for me because..."
                value={currentDetails || ''}
                onChange={handleAdditionalDetailsChange}
            />
        </div>
    )
}

export default AdditionalDetails
