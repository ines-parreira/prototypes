import React, {ReactNode} from 'react'

import css from './CardsWrapper.less'

type Props = {
    header?: ReactNode
    children: ReactNode
}

export default function Category({header, children}: Props) {
    return (
        <section>
            {header && <header className={css.header}>{header}</header>}
            {React.Children.count(children) > 0 && (
                <ul className={css.cardsWrapper}>{children}</ul>
            )}
        </section>
    )
}
