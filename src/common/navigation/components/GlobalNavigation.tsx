import React from 'react'

import useActiveItem from '../hooks/useActiveItem'
import css from './GlobalNavigation.less'
import Item from './GlobalNavigationItem'

export default function GlobalNavigation() {
    const activeItem = useActiveItem()

    return (
        <nav className={css.container}>
            <section className={css.section}>
                <div className={css.items}>
                    <Item
                        icon="home"
                        isActive={activeItem === 'home'}
                        url="/app/home"
                    />
                </div>
            </section>
        </nav>
    )
}
