import classNames from 'classnames'

import css from './SupportContentLearnMore.less'

type Props = {
    children: React.ReactNode
    url: string
}

export default function SupportContentLearnMore({ children, url }: Props) {
    return (
        <a
            href={url}
            rel="noopener noreferrer"
            target="_blank"
            className={css.learnMore}
        >
            <i className={classNames('material-icons', css.icon)}>menu_book</i>
            <div className={css.content}>{children}</div>
            <i className={classNames('material-icons', css.icon)}>
                open_in_new
            </i>
        </a>
    )
}
