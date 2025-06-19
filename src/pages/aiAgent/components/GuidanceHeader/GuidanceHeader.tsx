import { useParams } from 'react-router'

import { Banner, Tooltip } from '@gorgias/merchant-ui-kit'

import useLocalStorage from 'hooks/useLocalStorage'
import { AlertType } from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import { SearchBar } from 'pages/common/components/SearchBar/SearchBar'

import {
    GUIDANCE_ARTICLE_LIMIT,
    GUIDANCE_ARTICLE_LIMIT_WARNING,
} from '../../constants'
import { useGuidanceTemplates } from '../../hooks/useGuidanceTemplates'

import css from './GuidanceHeader.less'

const CREATE_GUIDANCE_BUTTON_ID = 'create-guidance-button'

type Props = {
    onCreateGuidanceClick: () => void
    onCreateFromTemplate: () => void
    onBrowseSuggestions: () => void
    guidanceArticlesLength: number
    hasAiGuidanceSuggestions: boolean
    isLoading: boolean
    onSearch: (value: string) => void
    searchQuery: string
}

export const GuidanceHeader = ({
    onCreateGuidanceClick,
    onCreateFromTemplate,
    onBrowseSuggestions,
    onSearch,
    searchQuery,
    guidanceArticlesLength,
    hasAiGuidanceSuggestions,
    isLoading,
}: Props) => {
    const isGuidanceArticleLimitReached =
        guidanceArticlesLength >= GUIDANCE_ARTICLE_LIMIT
    const isGuidanceArticleLimitWarning =
        guidanceArticlesLength >= GUIDANCE_ARTICLE_LIMIT_WARNING &&
        guidanceArticlesLength < GUIDANCE_ARTICLE_LIMIT
    const { guidanceTemplates } = useGuidanceTemplates()
    const isGuidanceTemplatesEmpty = guidanceTemplates.length === 0

    const displayCreateGuidanceButton =
        isLoading || (!hasAiGuidanceSuggestions && isGuidanceTemplatesEmpty)

    const { shopName } = useParams<{ shopName: string }>()
    const dismissedKey = `ai-agent-guidance-warning-dismissed-${shopName}`
    const [isDismissed, setIsDismissed] = useLocalStorage(dismissedKey, false)

    return (
        <>
            <div className={css.container}>
                <div className={css.header}>
                    <p
                        className={css.textGroup}
                        data-candu-id="ai-agent-guidance-has-guidance-articles"
                    >
                        Create Guidance to tell AI Agent how to handle customer
                        inquiries and end-to-end processes.
                    </p>

                    <div className={css.btnGroup}>
                        {displayCreateGuidanceButton ? (
                            <Button
                                isDisabled={isGuidanceArticleLimitReached}
                                onClick={onCreateGuidanceClick}
                                intent="secondary"
                                id={CREATE_GUIDANCE_BUTTON_ID}
                            >
                                Create Guidance
                            </Button>
                        ) : (
                            <>
                                <SearchBar
                                    placeholder="Search Guidance"
                                    onChange={(value) => onSearch(value)}
                                    value={searchQuery}
                                />
                                <Button
                                    isDisabled={isGuidanceArticleLimitReached}
                                    onClick={onCreateGuidanceClick}
                                    intent="secondary"
                                    id={CREATE_GUIDANCE_BUTTON_ID}
                                >
                                    Create Custom Guidance
                                </Button>

                                {hasAiGuidanceSuggestions ? (
                                    <Button onClick={onBrowseSuggestions}>
                                        Start from Template
                                    </Button>
                                ) : (
                                    <Button
                                        isDisabled={
                                            isGuidanceArticleLimitReached
                                        }
                                        onClick={onCreateFromTemplate}
                                    >
                                        Start From Template
                                    </Button>
                                )}
                            </>
                        )}
                        {isGuidanceArticleLimitReached && (
                            <Tooltip
                                target={CREATE_GUIDANCE_BUTTON_ID}
                                placement="bottom"
                            >
                                You can only add up to {GUIDANCE_ARTICLE_LIMIT}{' '}
                                pieces of guidance. Edit or delete Guidance to
                                further improve the AI Agent performance.
                            </Tooltip>
                        )}
                    </div>
                </div>
                {!isDismissed && isGuidanceArticleLimitWarning && (
                    <Banner
                        type={AlertType.Warning}
                        icon
                        fillStyle="fill"
                        className={css.alertBanner}
                        onClose={() => setIsDismissed(true)}
                    >
                        You’re approaching your Guidance limit:{' '}
                        {guidanceArticlesLength} out of {GUIDANCE_ARTICLE_LIMIT}{' '}
                        added. Once you reach the limit, you’ll need to delete
                        or update existing Guidance before adding new ones.
                    </Banner>
                )}
                {isGuidanceArticleLimitReached && (
                    <Banner
                        type={AlertType.Error}
                        icon
                        fillStyle="fill"
                        className={css.alertBanner}
                    >
                        You’ve reached the maximum of {GUIDANCE_ARTICLE_LIMIT}{' '}
                        Guidance entries. To add more, delete or update existing
                        ones.
                    </Banner>
                )}
            </div>
        </>
    )
}
