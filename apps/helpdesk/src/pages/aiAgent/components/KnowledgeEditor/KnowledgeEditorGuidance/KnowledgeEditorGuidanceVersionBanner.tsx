import { DateAndTimeFormatting, formatDatetime } from '@repo/utils'

import { Banner, Box, Button } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import {
    getDateAndTimeFormatter,
    getTimezone,
} from 'state/currentUser/selectors'

import { useGuidanceContext } from './context'
import { useVersionBanner } from './hooks/useVersionBanner'
import { useVersionHistory } from './hooks/useVersionHistory'

import css from './KnowledgeEditorGuidanceVersionBanner.less'

export function KnowledgeEditorGuidanceVersionBanner() {
    const {
        isViewingDraft,
        hasDraftVersion,
        hasPublishedVersion,
        isDisabled,
        switchVersion,
    } = useVersionBanner()

    const { isViewingHistoricalVersion, onGoToLatest } = useVersionHistory()
    const { state, dispatch } = useGuidanceContext()

    const timezone = useAppSelector(getTimezone)
    const dateAndTimeFormatter = useAppSelector(getDateAndTimeFormatter)

    if (isViewingHistoricalVersion) {
        const { historicalVersion } = state
        const formattedDate = historicalVersion?.publishedDatetime
            ? formatDatetime(
                  historicalVersion.publishedDatetime,
                  dateAndTimeFormatter(
                      DateAndTimeFormatting.CompactDateWithTime,
                  ),
                  timezone,
              )
            : 'unknown date'
        const commitMessage = historicalVersion?.commitMessage

        return (
            <div className={css.bannerWrapper}>
                <Banner
                    variant="inline"
                    intent="info"
                    size="sm"
                    isClosable={false}
                    icon="info"
                    title={`You are viewing a previous version published on ${formattedDate}.`}
                    description={
                        <>
                            {commitMessage && (
                                <div>
                                    Changes in this version: {commitMessage}
                                </div>
                            )}
                            <Box flexDirection="row" gap="sm" marginTop="xs">
                                <Button
                                    variant="primary"
                                    leadingSlot="arrow-left"
                                    onClick={onGoToLatest}
                                    isDisabled={isDisabled}
                                    size="sm"
                                >
                                    Back to current
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        dispatch({
                                            type: 'SET_MODAL',
                                            payload: 'restore',
                                        })
                                    }
                                    isDisabled={isDisabled}
                                    size="sm"
                                >
                                    Restore this version
                                </Button>
                            </Box>
                        </>
                    }
                />
            </div>
        )
    }

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
                    description={`Edit, test, and publish your draft to update the published version.`}
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
