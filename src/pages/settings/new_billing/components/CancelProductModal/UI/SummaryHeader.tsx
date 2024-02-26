import React from 'react'

type SummaryHeaderProps = {
    periodEnd: string
}
const SummaryHeader = ({periodEnd}: SummaryHeaderProps) => {
    return (
        <div className="body-regular">
            Please review the cancellation summary. Once you confirm
            cancellation, you'll continue to have full access to all your active
            products until the end of your billing cycle on{' '}
            <span className="body-semibold">{periodEnd}</span>.
        </div>
    )
}

export default SummaryHeader
