import { Link } from 'react-router-dom'

import { Banner } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { getHasAutomate } from 'state/billing/selectors'

type Props = {
    articleId: number
    shopName: string | null
}

export const HelpCenterArticleAIAgentBanner = ({
    articleId,
    shopName,
}: Props) => {
    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate || !shopName) {
        return null
    }

    const routes = getAiAgentNavigationRoutes(shopName)
    const knowledgeHubUrl = routes.knowledgeArticle('faq', articleId)

    return (
        <Banner
            variant="inline"
            intent="info"
            size="md"
            isClosable
            description={
                <>
                    To enable or disable this article for AI Agent, go to the{' '}
                    <Link to={knowledgeHubUrl}>Knowledge Hub</Link>.
                </>
            }
        />
    )
}
