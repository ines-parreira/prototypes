import React, {ComponentProps, ReactNode, useRef} from 'react'
import classNames from 'classnames'
import {Container} from 'reactstrap'

import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import HeaderTitle from 'pages/common/components/HeaderTitle'
import PageHeader from 'pages/common/components/PageHeader'
import {DrillDownModal} from 'pages/stats/DrillDownModal'

import css from './StatsPage.less'

type Props = {
    children: ReactNode
    filters?: ReactNode
} & ComponentProps<typeof HeaderTitle>

export default function StatsPage({
    children,
    filters,
    ...headerTitleProps
}: Props) {
    const ref = useRef(null)
    useInjectStyleToCandu(ref.current)

    return (
        <div className={classNames('full-width', css.wrapper)}>
            <div
                ref={ref}
                className={css.header}
                data-candu-id="stat-header-container"
            >
                <PageHeader
                    title={<HeaderTitle {...headerTitleProps} />}
                    className="mb-0"
                >
                    {filters && (
                        <div className="d-flex flex-wrap float-right">
                            {filters}
                        </div>
                    )}
                </PageHeader>
            </div>
            <div className={css.statsWrapper}>
                <Container fluid className={css.statsContainer}>
                    {children}
                </Container>
            </div>
            <DrillDownModal />
        </div>
    )
}
