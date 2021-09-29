import React, {useState, useEffect} from 'react'
import {Button} from 'reactstrap'

import InputField from '../../../../../../common/forms/InputField.js'
import {isUrl} from '../../../../../../../utils'

import {HelpCenterEditorToolbarPopoverButton} from './HelpCenterEditorToolbarPopoverButton'

type Link = {
    title: string
    target: string
    targetOption: string
}

type Props = {
    onChange: (
        option: 'link' | 'unlink',
        title?: string,
        target?: string,
        targetOption?: string
    ) => void
    currentState: {
        link: Link
        selectionText: string
    }
}

export const HelpCenterEditorToolbarLink = ({
    currentState,
    onChange,
}: Props) => {
    const [expanded, setExpanded] = useState(false)
    const [currentLink, setCurrentLink] = useState<Link>({
        target: '',
        targetOption: '',
        title: '',
    })

    const isActive = Boolean(currentState.link)
    const isDisabledButton =
        !currentLink.title || !currentLink.target || !isUrl(currentLink.target)

    useEffect(() => {
        if (expanded) {
            setCurrentLink(
                isActive
                    ? currentState.link
                    : {
                          target: '',
                          targetOption: '',
                          title: currentState.selectionText,
                      }
            )
        }
    }, [expanded])

    const removeLink = () => {
        onChange('unlink')
        setExpanded(false)
    }

    const addLink = () => {
        const {title, target, targetOption} = currentLink
        onChange('link', title, target, targetOption)
        setExpanded(false)
    }

    return (
        <HelpCenterEditorToolbarPopoverButton
            icon="link"
            active={isActive}
            isOpen={expanded}
            onOpen={() => setExpanded(true)}
            onClose={() => setExpanded(false)}
            tooltip="Insert link"
        >
            <div>
                <InputField
                    label="Link text"
                    placeholder="Ex. Help Center Article"
                    onChange={(newValue: string) =>
                        setCurrentLink((prevLink) => ({
                            ...prevLink,
                            title: newValue,
                        }))
                    }
                    value={currentLink.title}
                    autoFocus={!currentLink.title}
                />
                <InputField
                    label="URL"
                    placeholder="https://help.domain.com/article"
                    onChange={(newValue: string) =>
                        setCurrentLink((prevLink) => ({
                            ...prevLink,
                            target: newValue,
                        }))
                    }
                    value={currentLink.target}
                    autoFocus={currentLink.title}
                />
                <Button
                    color="primary"
                    disabled={isDisabledButton}
                    onClick={addLink}
                >
                    {isActive ? 'Update Link' : 'Insert Link'}
                </Button>
                {isActive && (
                    <Button style={{marginLeft: 10}} onClick={removeLink}>
                        Remove link
                    </Button>
                )}
            </div>
        </HelpCenterEditorToolbarPopoverButton>
    )
}
