import { LegacyBanner as Banner } from '@gorgias/axiom'

import { AlertType } from 'pages/common/components/Alert/Alert'

import { useVersionBanner } from './hooks/useVersionBanner'

import css from './KnowledgeEditorGuidanceVersionBanner.less'

export function KnowledgeEditorGuidanceVersionBanner() {
    const {
        isViewingDraft,
        hasDraftVersion,
        hasPublishedVersion,
        isDisabled,
        switchVersion,
    } = useVersionBanner()

    if (!hasDraftVersion || !hasPublishedVersion) {
        return null
    }

    if (isViewingDraft) {
        return (
            <div className={css.bannerWrapper}>
                <Banner
                    type={AlertType.Ai}
                    icon={null}
                    fillStyle="fill"
                    className={css.bannerClassName}
                >
                    <div className={css.bannerContent}>
                        <p className={css.title}>
                            This is a draft version. You also have a{' '}
                            <span
                                className={
                                    isDisabled ? css.linkDisabled : css.link
                                }
                                onClick={isDisabled ? undefined : switchVersion}
                            >
                                published version
                            </span>
                            .
                        </p>
                        <p className={css.description}>
                            Edit, test, and publish your draft to update the
                            published version.
                        </p>
                    </div>
                </Banner>
            </div>
        )
    }

    return (
        <div className={css.bannerWrapper}>
            <Banner
                type={AlertType.Ai}
                fillStyle="fill"
                className={css.bannerClassName}
                icon={null}
            >
                <p className={css.title}>
                    This is a published version. You also have a{' '}
                    <span
                        className={isDisabled ? css.linkDisabled : css.link}
                        onClick={isDisabled ? undefined : switchVersion}
                    >
                        draft version
                    </span>
                    .
                </p>
            </Banner>
        </div>
    )
}
