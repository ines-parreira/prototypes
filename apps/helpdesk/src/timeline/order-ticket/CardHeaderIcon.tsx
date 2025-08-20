import css from './OrderCard.less'

type CardHeaderIconProps = {
    src: string
    alt: string
}

function CardHeaderIcon({ src, alt }: CardHeaderIconProps) {
    return (
        <div className={css.cardIconContainer}>
            <img src={src} alt={alt} className={css.cardIcon} />
        </div>
    )
}

export default CardHeaderIcon
