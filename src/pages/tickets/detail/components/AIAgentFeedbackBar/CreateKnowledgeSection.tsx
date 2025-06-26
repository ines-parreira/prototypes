import { useRef, useState } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import DropdownButton from 'pages/common/components/button/DropdownButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less'

import { useKnowledgeSourceSideBar } from './hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { AiAgentKnowledgeResourceTypeEnum } from './types'

type LinkProps = {
    href?: string
    text: string
    onClick?: () => void
}

const LinkInText = ({ href, text, onClick }: LinkProps) => {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className={css.dropdownLink}
            onClick={onClick}
        >
            {text}
        </a>
    )
}

type CreateKnowledgeSectionProps = {
    shopName: string
    helpCenterId?: number | null
}

const CreateKnowledgeSection = ({
    shopName,
    helpCenterId,
}: CreateKnowledgeSectionProps) => {
    const [toggleDropdown, setToggleDropdown] = useState<boolean>(false)
    const buttonRef = useRef<HTMLDivElement>(null)

    const enableKnowledgeManagementFromTicketView = useFlag(
        FeatureFlagKey.EnableKnowledgeManagementFromTicketView,
    )

    const aiAgentNavigation = useAiAgentNavigation({ shopName })
    const guidanceLink = aiAgentNavigation.routes.guidanceTemplates
    const helpCenterArticlesLink = `/app/settings/help-center/${helpCenterId}/articles`
    const { openCreate } = useKnowledgeSourceSideBar()
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
                isDisabled={!helpCenterId}
            >
                Create knowledge
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
                            {...(enableKnowledgeManagementFromTicketView
                                ? {
                                      onClick: () =>
                                          openCreate(
                                              AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                                          ),
                                  }
                                : { href: guidanceLink })}
                        />
                    </DropdownItem>
                    <DropdownItem
                        onClick={() => setToggleDropdown(false)}
                        option={{
                            label: 'create_article',
                            value: 1,
                        }}
                        className={css.dropdownItem}
                    >
                        <LinkInText
                            href={helpCenterArticlesLink}
                            text="Create Help Center article"
                        />
                    </DropdownItem>
                </DropdownBody>
            </Dropdown>
        </div>
    )
}

export default CreateKnowledgeSection
