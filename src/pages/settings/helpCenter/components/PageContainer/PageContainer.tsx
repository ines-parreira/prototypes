import React from 'react'
import classNames from 'classnames'
import {Container} from 'reactstrap'

import css from './PageContainer.less'

type Props = {
    children: React.ReactNode
    className?: string
}

export const PageContainer: React.FC<Props> = ({
    children,
    className,
}: Props) => (
    <Container
        fluid
        className={classNames('page-container', css.container, className)}
    >
        {children}
    </Container>
)

export default PageContainer
