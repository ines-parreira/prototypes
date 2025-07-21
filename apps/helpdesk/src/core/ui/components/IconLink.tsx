import React from 'react'

import classnames from 'classnames'

type IconLinkProps = {
    content: string
    className?: string
    href: string
    icon: string
    rel?: string
    target?: string
    iconPosition?: 'prefix' | 'suffix'
    iconClassNames?: string
    ariaLabel?: string
}

const IconLink = ({
    content,
    className,
    href,
    icon,
    rel = 'noopener noreferrer',
    target = '_blank',
    iconPosition = 'prefix',
    iconClassNames = '',
    ariaLabel = 'link',
}: IconLinkProps) => {
    return (
        <a
            href={href}
            rel={rel}
            target={target}
            className={className}
            aria-label={ariaLabel}
        >
            {iconPosition === 'prefix' ? (
                <>
                    <i
                        className={classnames(
                            'material-icons mr-2',

                            iconClassNames,
                        )}
                    >
                        {icon}
                    </i>
                    {content}
                </>
            ) : (
                <>
                    {content}
                    <i
                        className={classnames(
                            'material-icons ml-2',
                            iconClassNames,
                        )}
                    >
                        {icon}
                    </i>
                </>
            )}
        </a>
    )
}

export default IconLink
