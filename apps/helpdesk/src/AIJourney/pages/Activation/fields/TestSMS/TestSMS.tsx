import { FieldPresentation, InputAction } from 'AIJourney/components'

import css from './TestSMS.less'

type TestSMSProps = {
    value?: string
    onChange?: (value: string) => void
    onActionClick?: () => Promise<void>
}

export const TestSMSField = ({
    value,
    onChange,
    onActionClick,
}: TestSMSProps) => {
    return (
        <div className={css.testSmsField}>
            <FieldPresentation
                name="Enter your phone number"
                description="Receive the test message directly on your phone."
            />
            <InputAction
                value={value}
                onChange={onChange}
                onActionClick={onActionClick}
            />
        </div>
    )
}
