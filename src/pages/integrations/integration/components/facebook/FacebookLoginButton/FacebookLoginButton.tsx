import React, {ReactNode} from 'react'
import classNames from 'classnames'
import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import facebookLogo from 'assets/img/integrations/facebook-icon.svg'

import css from './FacebookLoginButton.less'

type Props = {
    children?: ReactNode
    intent?: ButtonIntent
    onClick?: (e: React.SyntheticEvent) => void
    showIcon?: boolean
    isLoading?: boolean
}

export default function FacebookLoginButton({
    intent = 'primary',
    onClick,
    children,
    showIcon,
    isLoading,
}: Props) {
    return (
        <Button
            type="submit"
            intent={intent}
            onClick={onClick}
            isLoading={isLoading}
            className={classNames(css.facebookButton, {
                [css.primary]: intent === 'primary',
            })}
        >
            {showIcon && !isLoading && (
                <img
                    src={facebookLogo}
                    alt="facebook-logo"
                    className={css.facebookLogo}
                />
            )}
            {children || 'Login with Facebook'}
        </Button>
    )
}
