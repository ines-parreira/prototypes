import css from './ChurnMitigationOffer.less'

type ChurnMitigationOfferProps = {
    canduContentId: string | null
}

const ChurnMitigationOffer = ({
    canduContentId,
}: ChurnMitigationOfferProps) => {
    return (
        <div>
            {canduContentId ? (
                <div data-candu-id={canduContentId}></div>
            ) : (
                <div className={css.container}>
                    <span>
                        {`We get it--your business is unique. Before you cancel,
                        our team can review your plan and offer a custom
                        solution that fits your goals and budget.`}
                    </span>
                    <span>
                        {`Wheter you're scaling, testing new channels, or just
                        need a smaller plan, we'll make sure you're getting the
                        most value from Gorgias`}
                    </span>
                    <span>
                        {`Click "`}
                        <strong>Get My Offer</strong>
                        {`" and we'll reach
                        out to discuss your personalized options--no strings
                        attached.`}
                    </span>
                </div>
            )}
        </div>
    )
}

export default ChurnMitigationOffer
