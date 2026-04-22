import { useEffect, useMemo, useState } from 'react'

import {
    Box,
    Button,
    Heading,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    SearchField,
    Skeleton,
    Text,
} from '@gorgias/axiom'

import { useStoreIntegrationByShopName } from 'pages/settings/helpCenter/hooks/useStoreIntegrationByShopName'

import { useSkillsArticles } from '../../hooks/useSkillsArticles'
import type { TransformedArticle } from '../../types'
import { LinkToSkillRow } from './LinkToSkillRow'

import css from './LinkToSkillModal.less'

interface LinkToSkillModalProps {
    isOpen: boolean
    intentId: string | null
    helpCenterId: number
    shopName: string
    isLoading?: boolean
    onClose: () => void
    onConfirm: (intentId: string, article: TransformedArticle) => void
}

export const LinkToSkillModal = ({
    isOpen,
    intentId,
    helpCenterId,
    shopName,
    isLoading,
    onClose,
    onConfirm,
}: LinkToSkillModalProps) => {
    const storeIntegration = useStoreIntegrationByShopName(shopName)
    const shopIntegrationId = storeIntegration?.id

    const { articles, isLoading: isArticlesLoading } = useSkillsArticles(
        helpCenterId,
        shopIntegrationId || 0,
    )

    const [searchTerm, setSearchTerm] = useState('')
    const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
        null,
    )

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('')
            setSelectedArticleId(null)
        }
    }, [isOpen])

    const filteredArticles = useMemo(() => {
        if (!searchTerm.trim()) return articles
        const lower = searchTerm.toLowerCase()
        return articles.filter((article) =>
            article.title.toLowerCase().includes(lower),
        )
    }, [articles, searchTerm])

    const handleToggleArticle = (articleId: number) => {
        setSelectedArticleId((prev) => (prev === articleId ? null : articleId))
    }

    const handleConfirm = () => {
        if (!intentId || selectedArticleId === null) return
        const selectedArticle = articles.find((a) => a.id === selectedArticleId)
        if (!selectedArticle) return
        onConfirm(intentId, selectedArticle)
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
            size="sm"
        >
            <OverlayHeader
                title={
                    <Heading size="lg">Link intent to existing skill</Heading>
                }
            />
            <OverlayContent display="block">
                <Box flexDirection="column" gap="md" mt="10px">
                    <SearchField
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />

                    <Box flexDirection="column" maxHeight={450}>
                        {isArticlesLoading ? (
                            <Box flexDirection="column" gap="sm">
                                <Skeleton height="56px" />
                                <Skeleton height="56px" />
                                <Skeleton height="56px" />
                            </Box>
                        ) : (
                            <>
                                <Text
                                    size="md"
                                    color="content-neutral-tertiary"
                                    className={css.skillsText}
                                >
                                    {filteredArticles.length === 0
                                        ? 'No skills found'
                                        : 'All skills'}
                                </Text>
                                {filteredArticles.map((article) => (
                                    <LinkToSkillRow
                                        key={article.id}
                                        article={article}
                                        isSelected={
                                            selectedArticleId === article.id
                                        }
                                        onToggle={handleToggleArticle}
                                    />
                                ))}
                            </>
                        )}
                    </Box>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="sm" justifyContent="flex-end" width="100%">
                    <Button variant="tertiary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        isDisabled={selectedArticleId === null}
                        isLoading={isLoading}
                    >
                        Review and test
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
