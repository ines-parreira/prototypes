import { FieldPresentation, InputAction } from 'AIJourney/components'

import css from './TestSMS.less'

type TestSMSProps = {
    value?: string
    onChange?: (value: string) => void
}

export const TestSMSField = ({ value, onChange }: TestSMSProps) => {
    return (
        <div className={css.testSmsField}>
            <FieldPresentation
                name="Test phone number"
                description="Select the phone number to preview your campaign"
            />
            <InputAction value={value} onChange={onChange} />
        </div>
    )
}
