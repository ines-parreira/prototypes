import classNames from 'classnames'
import { Link } from 'react-router-dom'

import { Badge, Button } from '@gorgias/axiom'

import imgSrc from 'assets/img/ai-agent/guidance-empty-state.png'
import { logEvent, SegmentEvent } from 'common/segment'
import history from 'pages/history'

import { useAiAgentNavigation } from '../../hooks/useAiAgentNavigation'
import { useGuidanceTemplates } from '../../hooks/useGuidanceTemplates'
import { GuidanceTemplate } from '../../types'
import { CreateNewGuidanceCard } from '../CreateNewGuidanceCard/CreateNewGuidanceCard'
import { GuidanceTemplateCard } from '../GuidanceTemplateCard/GuidanceTemplateCard'

import css from './GuidanceEmptyState.less'

const SHOW_TEMPLATES_COUNT = 7

type Props = {
    shopName: string
}

export const GuidanceEmptyState = ({ shopName }: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })
    const { guidanceTemplates } = useGuidanceTemplates()
    const onNewClick = () => {
        history.push(routes.newGuidanceArticle)
    }
    const onGuidanceTemplateClick = (template: GuidanceTemplate) => {
        logEvent(SegmentEvent.AiAgentGuidanceCardClicked, {
            source: 'empty',
            type: 'template',
            name: template.name,
        })
        history.push(routes.newGuidanceTemplateArticle(template.id))
    }

    const isShowMoreTemplates = guidanceTemplates.length > SHOW_TEMPLATES_COUNT

    return (
        <>
            <div className={css.container}>
                <div className={css.innerContainer}>
                    <div className={css.content}>
                        <div>
                            <Badge type={'magenta'}>
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.autoAwesome,
                                    )}
                                >
                                    auto_awesome
                                </i>
                                AI Powered
                            </Badge>
                        </div>
                        <p className={css.title}>Get started with Guidance</p>
                        <p
                            className={css.subtitle}
                            data-candu-id="ai-agent-guidence-empty-state"
                        >
                            Add Guidance to tell AI Agent how to handle specific
                            topics or inquiries, and when to escalate tickets to
                            your team.
                        </p>
                    </div>
                    <div className={css.imageWrapper}>
                        <img
                            className={css.img}
                            src={imgSrc}
                            alt="Guidance Empty State"
                        />
                    </div>
                </div>
            </div>

            {guidanceTemplates.length > 0 && (
                <div className={css.templatesContainer}>
                    <div className={css.templatesContainerHeader}>
                        <h3 className={css.templatesTitle}>
                            Choose a template and customize it to fit your needs
                        </h3>
                        <div
                            className={css.templatesContainerHeaderButtonGroup}
                        >
                            <Button intent="secondary" onClick={onNewClick}>
                                Create Custom Guidance
                            </Button>
                            <Link to={routes.guidanceTemplates}>
                                <Button>Create From Template</Button>
                            </Link>
                        </div>
                    </div>
                    <ul className={css.templatesList}>
                        {guidanceTemplates
                            .slice(0, SHOW_TEMPLATES_COUNT)
                            .map((template) => (
                                <li key={template.id}>
                                    <GuidanceTemplateCard
                                        onClick={() =>
                                            onGuidanceTemplateClick(template)
                                        }
                                        guidanceTemplate={template}
                                    />
                                </li>
                            ))}

                        {isShowMoreTemplates ? (
                            <li>
                                <Link
                                    to={routes.guidanceTemplates}
                                    className={css.showMoreLink}
                                >
                                    <Button
                                        intent="secondary"
                                        fillStyle="ghost"
                                        trailingIcon="arrow_forward"
                                    >
                                        See All Templates
                                    </Button>
                                </Link>
                            </li>
                        ) : (
                            <li className={css.templatesItem}>
                                <CreateNewGuidanceCard shopName={shopName} />
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </>
    )
}
