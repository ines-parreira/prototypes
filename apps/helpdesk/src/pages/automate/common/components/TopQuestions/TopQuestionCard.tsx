import type { ReactNode } from 'react'
import React from 'react'

import classNames from 'classnames'

import {
    LegacyLoadingSpinner as LoadingSpinner,
    Skeleton,
} from '@gorgias/axiom'

import css from './TopQuestionCard.less'

type Props = {
    ticketsCount: number
    title: string
    onCreateArticle: () => Promise<void>
    onDismiss: () => Promise<void>
}

const Header = ({ children }: { children: ReactNode }) => (
    <div className={css.header}>{children}</div>
)

const TicketsCount = ({ ticketsCount }: Pick<Props, 'ticketsCount'>) => (
    <div className={css.ticketsCount}>
        <span>
            {ticketsCount} {ticketsCount > 1 ? 'tickets' : 'ticket'}
        </span>
    </div>
)

const Title = ({ title }: Pick<Props, 'title'>) => (
    <div className={css.title}>
        <span>
            <i className="material-icons rounded mr-1">article</i> {title}
        </span>
    </div>
)

const CreateArticle = ({ onCreateArticle }: Pick<Props, 'onCreateArticle'>) => {
    const [isCreating, setIsCreating] = React.useState(false)

    return isCreating ? (
        <div className={css.creatingArticle}>
            <LoadingSpinner size={20} />
            Creating...
        </div>
    ) : (
        <div
            onClick={() => {
                if (!isCreating) {
                    setIsCreating(true)
                    void onCreateArticle().finally(() => setIsCreating(false))
                }
            }}
            className={css.createArticle}
        >
            <span>Create Article</span>
        </div>
    )
}

const Dismiss = ({ onDismiss }: Pick<Props, 'onDismiss'>) => {
    const [isDismissing, setIsDismissing] = React.useState(false)

    return (
        <div
            onClick={() => {
                if (!isDismissing) {
                    setIsDismissing(true)
                    void onDismiss().finally(() => {
                        setIsDismissing(false)
                    })
                }
            }}
            className={css.dismiss}
        >
            <i className="material-icons">close</i>
        </div>
    )
}

export const TopQuestionCard = ({
    onCreateArticle,
    onDismiss,
    ticketsCount,
    title,
}: Props) => {
    return (
        <div className={classNames(css.container, css.card)}>
            <Header>
                <TicketsCount ticketsCount={ticketsCount} />
                <Dismiss onDismiss={onDismiss} />
            </Header>

            <Title title={title} />

            <CreateArticle onCreateArticle={onCreateArticle} />
        </div>
    )
}

export const TopQuestionCardGhost = () => <div className={css.container}></div>

const LoadingDiv = ({ heightPx }: { heightPx: number }) => (
    <Skeleton height={heightPx} baseColor="#d2d7de" highlightColor="#f4f5f7" />
)

export const TopQuestionCardLoading = () => {
    return (
        <div className={classNames(css.container, css.card)}>
            <LoadingDiv heightPx={24} />
            <LoadingDiv heightPx={72} />
            <LoadingDiv heightPx={32} />
        </div>
    )
}
