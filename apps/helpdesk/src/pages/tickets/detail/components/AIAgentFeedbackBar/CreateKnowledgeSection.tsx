import { useRef, useState } from 'react'

import DropdownButton from 'pages/common/components/button/DropdownButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import { useAbilityChecker } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'

import { AiAgentKnowledgeResourceTypeEnum } from './types'
import { getHelpcenterIdAsString } from './utils'

type LinkProps = {
    text: string
    onClick?: () => void
}

const LinkInText = ({ text, onClick }: LinkProps) => {
    return (
        <a className={css.dropdownLink} onClick={onClick}>
            {text}
        </a>
    )
}

type CreateKnowledgeSectionProps = {
    helpCenterId?: number | null
    onKnowledgeResourceCreateClick: (
        resourceType: AiAgentKnowledgeResourceTypeEnum,
        resourceSetId: string,
    ) => void
}

const CreateKnowledgeSection = ({
    helpCenterId,
    onKnowledgeResourceCreateClick,
}: CreateKnowledgeSectionProps) => {
    const [toggleDropdown, setToggleDropdown] = useState<boolean>(false)
    const buttonRef = useRef<HTMLDivElement>(null)

    const { isPassingRulesCheck } = useAbilityChecker()
    const { openCreate } = useKnowledgeSourceSideBar()
    const canCreateArticle = isPassingRulesCheck(({ can }) =>
        can('create', 'ArticleEntity'),
    )

    const getLinkProps = (resourceType: AiAgentKnowledgeResourceTypeEnum) => {
        return {
            onClick: () => {
                onKnowledgeResourceCreateClick(
                    resourceType,
                    getHelpcenterIdAsString(helpCenterId),
                )
                openCreate(resourceType)
            },
        }
    }

    return (
        <div>
            <div className={css.info}>
                Create new knowledge to be used in similar requests.
            </div>
            <DropdownButton
                onToggleClick={() => setToggleDropdown(!toggleDropdown)}
                onClick={() => setToggleDropdown(!toggleDropdown)}
                fillStyle="fill"
                intent="secondary"
                size="small"
                ref={buttonRef}
            >
                Create content
            </DropdownButton>
            <Dropdown
                onToggle={setToggleDropdown}
                isOpen={toggleDropdown}
                target={buttonRef}
                placement="bottom-end"
            >
                <DropdownBody>
                    <DropdownItem
                        onClick={() => setToggleDropdown(false)}
                        option={{
                            label: 'create_guidance',
                            value: 1,
                        }}
                        className={css.dropdownItem}
                    >
                        <LinkInText
                            text="Create Guidance"
                            {...getLinkProps(
                                AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                            )}
                        />
                    </DropdownItem>
                    {canCreateArticle && helpCenterId && (
                        <DropdownItem
                            onClick={() => setToggleDropdown(false)}
                            option={{
                                label: 'create_article',
                                value: 1,
                            }}
                            className={css.dropdownItem}
                        >
                            <LinkInText
                                text="Create Help Center article"
                                {...getLinkProps(
                                    AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                                )}
                            />
                        </DropdownItem>
                    )}
                </DropdownBody>
            </Dropdown>
        </div>
    )
}

export default CreateKnowledgeSection
