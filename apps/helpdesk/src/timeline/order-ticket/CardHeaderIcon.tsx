import css from './OrderTicket.less'

type CardHeaderIconProps = {
    src: string
    alt: string
}

function CardHeaderIcon({ src, alt }: CardHeaderIconProps) {
    return <img src={src} alt={alt} className={css.cardIconContainer} />
}

export default CardHeaderIcon
