import React, {ReactNode} from 'react'
import classnames from 'classnames'
import {Container} from 'reactstrap'

import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'

import css from './AutomationView.less'

type Props = {
    title: ReactNode
    action?: ReactNode
    isLoading?: boolean
    children: ReactNode
}

const AutomationView = ({title, action, isLoading, children}: Props) => {
    return (
        <div className="full-width">
            <PageHeader title={title}>{action}</PageHeader>
            <Container
                fluid
                className={classnames(css.container, {
                    [css.isLoading]: isLoading,
                })}
            >
                {isLoading ? <Loader /> : children}
            </Container>
        </div>
    )
}

export default AutomationView
