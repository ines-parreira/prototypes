import css from './Card.less'

export type CardProps = {
    children: React.ReactNode
    title: string | React.ReactNode
    link?: {
        text: string
        url: string
    }
}

const Card = ({ children, title, link }: CardProps) => {
    return (
        <div className={css.container}>
            <div className={css.header}>
                <h2 className={css.title}>{title}</h2>
                {link && (
                    <a
                        className={css.link}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        {link.text}
                        <i className="material-icons">open_in_new</i>
                    </a>
                )}
            </div>
            <div>{children}</div>
        </div>
    )
}

export default Card
