import React, {useState} from 'react'
import Disclaimer from '../UI/Disclaimer'
import Button from '../../../../../common/components/button/Button'
import css from './CancellationSummaryFooter.less'

type CancellationSummaryFooterProps = {
    onConfirm: () => void
    isLoading: boolean
}
const CancellationSummaryFooter = ({
    onConfirm,
    isLoading,
}: CancellationSummaryFooterProps) => {
    const [isAgreementChecked, setAgreementChecked] = useState<boolean>(false)

    return (
        <div className={css.container}>
            <Disclaimer
                agreementChecked={isAgreementChecked}
                onChange={setAgreementChecked}
            />
            <Button
                intent="destructive"
                fillStyle="fill"
                isDisabled={!isAgreementChecked}
                isLoading={isLoading}
                onClick={onConfirm}
                className={css.confirmationButton}
            >
                Confirm Auto-Renewal Cancellation
            </Button>
        </div>
    )
}

export default CancellationSummaryFooter
