import { Skeleton } from '@gorgias/axiom'

import css from './KnowledgeEditorContentSkeleton.less'

const NUMBER_OF_CONTENT_SECTIONS = 4
export const KnowledgeEditorContentSkeleton = () => {
    const bodySkeleton = () => {
        return (
            <div className={css.content}>
                <Skeleton height={12} containerClassName={css.line} />
                <Skeleton height={12} containerClassName={css.line} />
                <Skeleton height={12} containerClassName={css.line} />
                <Skeleton
                    width="50%"
                    height={12}
                    containerClassName={css.line}
                />
            </div>
        )
    }

    const bodySkeletons = Array.from(
        { length: NUMBER_OF_CONTENT_SECTIONS },
        (_, index) => <div key={index}>{bodySkeleton()}</div>,
    )

    return (
        <div className={css.container}>
            <Skeleton width="100%" height={32} containerClassName={css.title} />
            {bodySkeletons}
        </div>
    )
}
