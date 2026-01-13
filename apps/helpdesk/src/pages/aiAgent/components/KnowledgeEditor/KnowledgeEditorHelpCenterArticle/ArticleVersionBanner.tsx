import { Banner } from '@gorgias/axiom'

import { useVersionBanner } from './hooks/useVersionBanner'

import css from './ArticleVersionBanner.less'

export function ArticleVersionBanner() {
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
                    variant="inline"
                    intent="info"
                    size="sm"
                    isClosable={false}
                    icon="info"
                    title={
                        <>
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
                        </>
                    }
                    description="Edit, test, and publish your draft to update the published version."
                />
            </div>
        )
    }

    return (
        <div className={css.bannerWrapper}>
            <Banner
                variant="inline"
                intent="info"
                size="sm"
                isClosable={false}
                icon="info"
                title={
                    <>
                        This is a published version. You also have a{' '}
                        <span
                            className={isDisabled ? css.linkDisabled : css.link}
                            onClick={isDisabled ? undefined : switchVersion}
                        >
                            draft version
                        </span>
                        .
                    </>
                }
            />
        </div>
    )
}
