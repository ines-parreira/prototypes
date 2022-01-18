import React, {ComponentProps, ReactNode} from 'react'
import classNames from 'classnames'
import {Container} from 'reactstrap'

import PageHeader from '../common/components/PageHeader'

import css from './StatsPage.less'
import StatsPageTitle from './StatsPageTitle'

type Props = {
    children: ReactNode
    filters: ReactNode
} & ComponentProps<typeof StatsPageTitle>

export default function StatsPage({
    children,
    filters,
    ...statsPageTitleProps
}: Props) {
    return (
        <div className={classNames('full-width', css.wrapper)}>
            <div className={css.header}>
                <PageHeader
                    title={<StatsPageTitle {...statsPageTitleProps} />}
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
