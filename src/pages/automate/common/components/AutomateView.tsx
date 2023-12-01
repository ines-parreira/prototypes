import React, {ReactNode} from 'react'
import classnames from 'classnames'
import {Container} from 'reactstrap'

import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'

import css from './AutomateView.less'

type Props = {
    title: ReactNode
    action?: ReactNode
    isLoading?: boolean
    children: ReactNode
    className?: string
}

const AutomateView = ({
    title,
    action,
    isLoading,
    children,
    className,
}: Props) => {
    return (
        <div className="full-width">
            <PageHeader title={title}>{action}</PageHeader>
            <Container
                fluid
                className={classnames(css.container, className, {
                    [css.isLoading]: isLoading,
                })}
            >
                {isLoading ? <Loader /> : children}
            </Container>
        </div>
    )
}

export default AutomateView
