import React, {ComponentProps, ReactNode} from 'react'
import classNames from 'classnames'
import {Container} from 'reactstrap'

import HeaderWithInfo from 'pages/common/components/HeaderWithInfo'
import PageHeader from 'pages/common/components/PageHeader'

import css from './StatsPage.less'

type Props = {
    children: ReactNode
    filters: ReactNode
} & ComponentProps<typeof HeaderWithInfo>

export default function StatsPage({
    children,
    filters,
    ...headerWithInfoProps
}: Props) {
    return (
        <div className={classNames('full-width', css.wrapper)}>
            <div className={css.header} data-candu-id="stat-header-container">
                <PageHeader
                    title={<HeaderWithInfo {...headerWithInfoProps} />}
                    className="mb-0"
                >
                    <div className="d-flex flex-wrap float-right">
                        {filters}
                    </div>
                </PageHeader>
            </div>
            <div className={css.statsWrapper}>
                <Container fluid className={css.statsContainer}>
                    {children}
                </Container>
            </div>
        </div>
    )
}
