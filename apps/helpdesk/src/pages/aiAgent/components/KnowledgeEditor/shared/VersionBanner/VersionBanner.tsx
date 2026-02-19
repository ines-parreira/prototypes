import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { DateAndTimeFormatting, formatDatetime } from '@repo/utils'

import { Banner, Box, Button, Text, ToggleField } from '@gorgias/axiom'
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
    isDiffMode?: boolean
    onToggleDiff?: () => void
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
    isDiffMode,
    onToggleDiff,
    className,
}: VersionBannerProps) {
    const isDiffingEnabled = useFlag(FeatureFlagKey.AddDiffingForVersionHistory)
    const timezone = useAppSelector(getTimezone)
    const dateAndTimeFormatter = useAppSelector(getDateAndTimeFormatter)

    const publisherUserId = historicalVersion?.publisherUserId
    const { data: publisherData } = useGetUser<{ data: { name: string } }>(
        publisherUserId ?? 0,
        { query: { enabled: !!publisherUserId } },
    )
    const publisherName = publisherData?.data?.name

    // Show historical version banner only when viewing a historical version (not when comparing draft to published)
    if (isViewingHistoricalVersion && !isViewingDraft) {
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
                return `Changes by ${publisherName}: ${commitMessage}`
            }
            if (commitMessage) {
                return `Changes in this version: ${commitMessage}`
            }
            if (publisherName) {
                return `Changes by ${publisherName}`
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
                    title={`You are viewing a previous version published on ${formattedDate}`}
                    description={
                        <>
                            {versionDescription && (
                                <div>{versionDescription}</div>
                            )}
                            <Box
                                flexDirection="row"
                                justifyContent="space-between"
                                alignItems="center"
                                marginTop="xs"
                                width="100%"
                            >
                                <Button
                                    variant="secondary"
                                    leadingSlot="arrow-left"
                                    onClick={onGoToLatest}
                                    isDisabled={isDisabled}
                                    size="sm"
                                >
                                    Back to latest
                                </Button>
                                {isDiffingEnabled && onToggleDiff && (
                                    <Box
                                        flexDirection="row"
                                        alignItems="center"
                                        gap="xs"
                                    >
                                        <ToggleField
                                            value={!!isDiffMode}
                                            onChange={() => onToggleDiff()}
                                            isDisabled={isDisabled}
                                        />
                                        <Text size="sm" variant="medium">
                                            Compare to current
                                        </Text>
                                    </Box>
                                )}
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
                    description={
                        <>
                            <div>
                                Edit, test, and publish your draft to update the
                                published version.
                            </div>
                            {isDiffingEnabled && onToggleDiff && (
                                <Box
                                    flexDirection="row"
                                    justifyContent="flex-end"
                                    alignItems="center"
                                    marginTop="xs"
                                    width="100%"
                                >
                                    <Box
                                        flexDirection="row"
                                        alignItems="center"
                                        gap="xs"
                                    >
                                        <ToggleField
                                            value={!!isDiffMode}
                                            onChange={() => onToggleDiff()}
                                            isDisabled={isDisabled}
                                        />
                                        <Text size="sm" variant="medium">
                                            Compare to current
                                        </Text>
                                    </Box>
                                </Box>
                            )}
                        </>
                    }
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
