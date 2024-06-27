import React, {useRef} from 'react'
import classNames from 'classnames'
import {Label} from '@gorgias/ui-kit'

import UncontrolledDropdown from 'pages/common/components/dropdown/UncontrolledDropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Button from 'pages/common/components/button/Button'

import css from './FeedbackCreateResource.less'

type Props = {
    shopType: string
    shopName: string
    helpCenterId: number
}

const FeedbackCreateResource: React.FC<Props> = ({
    shopType,
    shopName,
    helpCenterId,
}) => {
    const dropdownTargetRef = useRef(null)

    const actionLink = `/app/automation/${shopType}/${shopName}/ai-agent/actions/new`
    const guidanceLink = `/app/automation/${shopType}/${shopName}/ai-agent/guidance/templates`
    const helpCenterArticlesLink = `/app/settings/help-center/${helpCenterId}/articles`

    return (
        <div className={css.container}>
            <Label>No relevant resources?</Label>
            <div className={css.info}>
                Create Actions, Guidance or knowledge to help AI Agent respond
                to messages like this
            </div>
            <div ref={dropdownTargetRef}>
                <Button
                    intent="secondary"
                    fillStyle="fill"
                    size="medium"
                    className={css.createResourceButton}
                >
                    Create Resource
                    <i
                        className={classNames(
                            'material-icons',
                            css.arrowDownIcon
                        )}
                    >
                        arrow_drop_down
                    </i>
                </Button>

                <UncontrolledDropdown target={dropdownTargetRef}>
                    <DropdownBody>
                        <DropdownItem
                            className={css.dropdownItem}
                            option={{label: 'Create Action', value: 'action'}}
                            onClick={() => {
                                window.open(actionLink, '_blank')
                            }}
                        >
                            <span>Create Action</span>
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.openIcon
                                )}
                            >
                                open_in_new
                            </i>
                        </DropdownItem>
                        <DropdownItem
                            className={css.dropdownItem}
                            option={{
                                label: 'Create Guidance',
                                value: 'guidance',
                            }}
                            onClick={() => {
                                window.open(guidanceLink, '_blank')
                            }}
                        >
                            <span>Create Guidance</span>
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.openIcon
                                )}
                            >
                                open_in_new
                            </i>
                        </DropdownItem>
                        <DropdownItem
                            className={css.dropdownItem}
                            option={{
                                label: 'Create Help Center article',
                                value: 'help-center-article',
                            }}
                            onClick={() => {
                                window.open(helpCenterArticlesLink, '_blank')
                            }}
                        >
                            <span>Create Help Center article</span>
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.openIcon
                                )}
                            >
                                open_in_new
                            </i>
                        </DropdownItem>
                    </DropdownBody>
                </UncontrolledDropdown>
            </div>
        </div>
    )
}

export default FeedbackCreateResource
