import css from './Info.less'

interface InfoProps {
    content: string
}

export const Info = ({ content }: InfoProps) => {
    return (
        <div className={css.infoContainer}>
            <i className="material-icons-outlined">info</i>
            <span>{content}</span>
        </div>
    )
}
