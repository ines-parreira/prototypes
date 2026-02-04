import { DateAndTimeFormatting, formatDatetime } from '@repo/utils'

import { Banner, Box, Button } from '@gorgias/axiom'
import { useGetUser } from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'
import {
    getDateAndTimeFormatter,
    getTimezone,
} from 'state/currentUser/selectors'

import css from './VersionBanner.less'

type HistoricalVersion = {
    publishedDatetime: string | null
    publisherUserId?: number
    commitMessage?: string
} | null

type VersionBannerProps = {
    isViewingDraft: boolean
    hasDraftVersion: boolean
    hasPublishedVersion: boolean
    isDisabled: boolean
    switchVersion: () => void
    isViewingHistoricalVersion: boolean
    onGoToLatest: () => void
    historicalVersion: HistoricalVersion
    onOpenRestoreModal: () => void
    className?: string
}

export function VersionBanner({
    isViewingDraft,
    hasDraftVersion,
    hasPublishedVersion,
    isDisabled,
    switchVersion,
    isViewingHistoricalVersion,
    onGoToLatest,
    historicalVersion,
    onOpenRestoreModal,
    className,
}: VersionBannerProps) {
    const timezone = useAppSelector(getTimezone)
    const dateAndTimeFormatter = useAppSelector(getDateAndTimeFormatter)

    const publisherUserId = historicalVersion?.publisherUserId
    const { data: publisherData } = useGetUser<{ data: { name: string } }>(
        publisherUserId ?? 0,
        { query: { enabled: !!publisherUserId } },
    )
    const publisherName = publisherData?.data?.name

    if (isViewingHistoricalVersion) {
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

        const getVersionDescription = () => {
            if (commitMessage && publisherName) {
                return `By ${publisherName}: ${commitMessage}`
            }
            if (commitMessage) {
                return `Changes in this version: ${commitMessage}`
            }
            if (publisherName) {
                return `By ${publisherName}`
            }
            return null
        }

        const versionDescription = getVersionDescription()

        return (
            <div className={`${css.bannerWrapper} ${className ?? ''}`}>
                <Banner
                    variant="inline"
                    intent="info"
                    size="sm"
                    isClosable={false}
                    icon="info"
                    title={`You are viewing a previous version published on ${formattedDate}.`}
                    description={
                        <>
                            {versionDescription && (
                                <div>{versionDescription}</div>
                            )}
                            <Box flexDirection="row" gap="sm" marginTop="xs">
                                <Button
                                    variant="primary"
                                    leadingSlot="arrow-left"
                                    onClick={onGoToLatest}
                                    isDisabled={isDisabled}
                                    size="sm"
                                >
                                    Back to latest
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={onOpenRestoreModal}
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
            <div className={`${css.bannerWrapper} ${className ?? ''}`}>
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
        <div className={`${css.bannerWrapper} ${className ?? ''}`}>
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
