import {Badge} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import React from 'react'

import {assetsUrl} from 'utils'

import css from './Detail.less'
import {ProductDetail} from './types'

export default function Header(props: ProductDetail) {
    const {image, icon, title, description, categories = [], company} = props

    return (
        <header className={css.hero}>
            {image ? (
                <img
                    src={image.startsWith('http') ? image : assetsUrl(image)}
                    alt={`${title}'s logo`}
                    className={css.heroImage}
                />
            ) : (
                icon && (
                    <i
                        className={classNames(
                            css.heroIcon,
                            'material-icons-outlined'
                        )}
                    >
                        {props.icon}
                    </i>
                )
            )}

            <div>
                <h1 className={css.heroHeading}>{title}</h1>
                <p className={css.heroDescription}>{description}</p>
                <div className={css.heroMeta}>
                    {categories.length > 0 &&
                        categories.map((category, index) => (
                            <Badge
                                key={index}
                                type={
                                    typeof category !== 'string'
                                        ? category.type
                                        : 'grey'
                                }
                                className={css.badge}
                            >
                                {(typeof category === 'string'
                                    ? category
                                    : category.label
                                ).toUpperCase()}
                            </Badge>
                        ))}
                    {company && (
                        <span
                            className={classNames({
                                [css.by]: categories.length > 0,
                            })}
                        >
                            by{' '}
                            <a
                                href={company.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {company.name}
                            </a>
                        </span>
                    )}
                </div>
            </div>
        </header>
    )
}
