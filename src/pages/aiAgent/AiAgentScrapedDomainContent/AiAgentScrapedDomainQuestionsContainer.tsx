import { useState } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { useParams } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import { useSearchParam } from 'hooks/useSearchParam'

import { AiAgentLayout } from '../components/AiAgentLayout/AiAgentLayout'
import { AI_AGENT, KNOWLEDGE } from '../constants'
import AiAgentScrapedDomainContentLayout from './AiAgentScrapedDomainContentLayout'
import { CONTENT_TYPE, PAGINATED_ITEMS_PER_PAGE } from './constant'
import ScrapedDomainContentView from './ScrapedDomainContentView'
import ScrapedDomainSelectedContent from './ScrapedDomainSelectedContent'
import { ScrapedContent } from './types'

import css from './AiAgentScrapedDomainQuestionsContainer.less'

const AiAgentScrapedDomainQuestionsContainer = () => {
    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    const { shopName } = useParams<{
        shopName: string
    }>()

    const [isOpened, setIsOpened] = useState(false)
    const [selectedQuestion, setSelectedQuestion] =
        useState<ScrapedContent | null>(null)

    const handleOnSelect = (content: ScrapedContent) => {
        setSelectedQuestion(content)
        setIsOpened(true)
    }

    const handleOnClose = () => {
        setSelectedQuestion(null)
        setIsOpened(false)
    }

    const [value, setSearchParam] = useSearchParam('page')
    const currentPage = Number(value) || 1

    const onPageChange = (page: number) => {
        if (currentPage !== page) {
            setSearchParam(page.toString())
        }
    }

    // Mocked data to replace by actual data in the next iteration
    // https://linear.app/gorgias/issue/AIKNL-88/implement-functionality-for-pages-content-tab
    const mockedQuestions = [
        {
            id: 1,
            name: 'What should I do if I received a defective item?',
        },
        {
            id: 2,
            name: 'What’s your return policy?',
        },
        {
            id: 3,
            name: 'How do exchanges work?',
        },
        {
            id: 4,
            name: 'What’s your shipping policy?',
        },
        {
            id: 5,
            name: 'Do you offer product warranties?',
        },
        {
            id: 6,
            name: 'Do you offer refunds?',
        },
        {
            id: 7,
            name: 'How can I access my account?',
        },
        {
            id: 8,
            name: 'Where are your products made?',
        },
        {
            id: 9,
            name: 'Do you have physical locations?',
        },
        {
            id: 10,
            name: 'Do you offer customization?',
        },
        {
            id: 11,
            name: 'How can I report an issue with my order?',
        },
        {
            id: 12,
            name: 'Do you offer discounts?',
        },
        {
            id: 13,
            name: 'How does your sizing work?',
        },
        {
            id: 14,
            name: 'Do you ship to all 50 states?',
        },
        {
            id: 15,
            name: 'Do you have a loyality program?',
        },
        {
            id: 16,
            name: 'Do you have a loyality program?',
        },
    ]

    const startIndex = (currentPage - 1) * PAGINATED_ITEMS_PER_PAGE
    const endIndex = startIndex + PAGINATED_ITEMS_PER_PAGE
    const paginatedQuestions = mockedQuestions.slice(startIndex, endIndex)

    return (
        <AiAgentLayout
            className={css.container}
            shopName={shopName}
            title={isStandaloneMenuEnabled ? KNOWLEDGE : AI_AGENT}
        >
            <AiAgentScrapedDomainContentLayout shopName={shopName}>
                <ScrapedDomainContentView
                    isLoading={false}
                    content={paginatedQuestions}
                    onSelect={handleOnSelect}
                    pageType={CONTENT_TYPE.QUESTION}
                    hasNextItems={endIndex < mockedQuestions.length}
                    hasPrevItems={startIndex > 0}
                    fetchNextItems={() => onPageChange(currentPage + 1)}
                    fetchPrevItems={() => onPageChange(currentPage - 1)}
                />
                <ScrapedDomainSelectedContent
                    selectedContent={selectedQuestion}
                    contentType={CONTENT_TYPE.QUESTION}
                    isOpened={isOpened}
                    isLoading={false}
                    onClose={handleOnClose}
                />
            </AiAgentScrapedDomainContentLayout>
        </AiAgentLayout>
    )
}

export default AiAgentScrapedDomainQuestionsContainer
