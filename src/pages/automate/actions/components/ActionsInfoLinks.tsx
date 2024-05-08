import React from 'react'
import css from './ActionsInfoLinks.less'

export default function ActionsInfoLinks() {
    return (
        <div className={css.container}>
            <a
                href="https://link.gorgias.com/0io"
                rel="noopener noreferrer"
                target="_blank"
            >
                <i className="material-icons mr-2">menu_book</i>
                Learn more about actions
            </a>
            <a
                href="https://link.gorgias.com/zm2"
                rel="noopener noreferrer"
                target="_blank"
            >
                <i className="material-icons mr-2">menu_book</i>
                How to set up Actions
            </a>
        </div>
    )
}
