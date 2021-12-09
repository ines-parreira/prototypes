import React, {ReactNode} from 'react'
import classNames from 'classnames'
import {Button, Container} from 'reactstrap'

import PageHeader from '../common/components/PageHeader'
import PopoverModal from '../common/components/PopoverModal'

import css from './StatsPage.less'

type Props = {
    children: ReactNode
    title: string
    description: string
    helpUrl: string
    filters: ReactNode
}

export default function StatsPage({
    children,
    title,
    description,
    helpUrl,
    filters,
}: Props) {
    return (
        <div className={classNames('full-width', css.wrapper)}>
            <div className={css.filtersWrapper}>
                <PageHeader
                    title={
                        <h1 className="align-items-center">
                            <span>{title}</span>
                            <PopoverModal
                                className="ml-3"
                                placement="bottom-start"
                            >
                                <p className={css.learnMoreContent}>
                                    {description}
                                </p>
                                <Button
                                    className={css.titleTooltipButton}
                                    color="secondary"
                                    type="button"
                                    onClick={() => {
                                        window.open(helpUrl, '_blank')!.focus()
                                    }}
                                >
                                    Learn More{' '}
                                    <i className="material-icons">
                                        arrow_forward
                                    </i>
                                </Button>
                            </PopoverModal>
                        </h1>
                    }
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
