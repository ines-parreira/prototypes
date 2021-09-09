import React, {useState} from 'react'

import {
    Button,
    Collapse,
    ListGroup,
    ListGroupItem,
    Popover,
    PopoverBody,
} from 'reactstrap'

import {fromJS, Map, List} from 'immutable'

import InputField from '../../../../../../forms/InputField'
import expandUp from '../../../../../../../../../img/infobar/expand-up-blue.svg'
import expandDown from '../../../../../../../../../img/infobar/expand-down.svg'

type Props = {
    widget: Map<any, any>
    template: Map<any, any>
    isEditing: boolean
}

export default function WidgetCustomRedirectionLinks(props: Props) {
    const {
        redirectionLinks,
        popoverOpen,
        collapseOpen,
        togglePopup,
        toggleCollapse,
        handleSubmit,
        closePopup,
        handleLinkTitleChange,
        handleLinkUrlChange,
        canAdd,
    } = useWidgetCustomRedirectionLinks(props.widget)

    const maxVisibleLinks = 3 // Max number of visible links without using the collapse (only when not editing)
    const templatePath = props.template.get('templatePath', '') as string
    const buttonId = `redirection-link-button-${templatePath.replace(
        /\./g,
        ''
    )}`

    const getLink = (link: Map<string, string>) => {
        return (
            <ListGroupItem
                tag="a"
                href={link.get('url')}
                key={link.get('name')}
                target="_blank"
                rel="noopener noreferrer"
                className="border-0"
            >
                {link.get('name')}
                <i className="material-icons ml-2">open_in_new</i>
            </ListGroupItem>
        )
    }

    const getAllLinks = () =>
        redirectionLinks.map((link: Map<string, string>) => {
            return getLink(link)
        })

    const getVisibleLinks = () =>
        redirectionLinks
            .slice(0, maxVisibleLinks)
            .map((link: Map<string, string>) => {
                return getLink(link)
            })

    const getCollapsedLinks = () =>
        redirectionLinks
            .slice(maxVisibleLinks)
            .map((link: Map<string, string>) => {
                return getLink(link)
            })

    return (
        <>
            <div>
                <ListGroup flush>
                    {props.isEditing ? getAllLinks() : getVisibleLinks()}
                    {!props.isEditing &&
                        redirectionLinks.size > maxVisibleLinks && (
                            <>
                                <Collapse isOpen={collapseOpen}>
                                    {getCollapsedLinks()}
                                </Collapse>
                                <ListGroupItem
                                    tag="a"
                                    href="#"
                                    onClick={toggleCollapse}
                                    className="border-0"
                                >
                                    <img
                                        src={
                                            collapseOpen ? expandUp : expandDown
                                        }
                                        alt="Expand"
                                        className="mr-2"
                                    />
                                    {collapseOpen ? 'SHOW LESS' : 'SHOW MORE'}
                                </ListGroupItem>
                            </>
                        )}
                </ListGroup>
            </div>

            {props.isEditing && (
                <>
                    <Button type="button" id={buttonId}>
                        <i className="material-icons mr-2">add</i>
                        Add Redirection Link
                    </Button>
                    <Popover
                        placement="bottom"
                        isOpen={popoverOpen}
                        target={buttonId}
                        toggle={togglePopup}
                    >
                        <PopoverBody>
                            <InputField
                                type="text"
                                name="redirectionLink.title"
                                label="Title"
                                placeholder="My link"
                                onChange={handleLinkTitleChange}
                            />
                            <InputField
                                type="text"
                                name="redirectionLink.url"
                                label="Link"
                                placeholder="https://www.gorgias.com"
                                onChange={handleLinkUrlChange}
                            />
                            <div>
                                <Button
                                    color="primary"
                                    type="submit"
                                    className="mr-2"
                                    onClick={handleSubmit}
                                    disabled={!canAdd}
                                >
                                    Submit
                                </Button>
                                <Button
                                    color="secondary"
                                    type="button"
                                    onClick={closePopup}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </PopoverBody>
                    </Popover>
                </>
            )}
        </>
    )
}

function useWidgetCustomRedirectionLinks(widget: Map<any, any>) {
    const [redirectionLinks, setRedirectionLinks] = useState<List<any>>(
        widget.getIn(
            ['template', 'widgets', 0, 'meta', 'custom', 'links'],
            List([])
        )
    )
    const [redirectionLinkTitle, setRedirectionLinkTitle] = useState('')
    const [redirectionLinkUrl, setRedirectionLinkUrl] = useState('')
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [collapseOpen, setCollapseOpen] = useState(false)
    const [canAdd, setCanAdd] = useState(false)

    const togglePopup = () => {
        setPopoverOpen(!popoverOpen)
    }

    const toggleCollapse = () => {
        setCollapseOpen(!collapseOpen)
    }

    const handleSubmit = () => {
        const newLink = fromJS({
            name: redirectionLinkTitle,
            url: redirectionLinkUrl,
        })

        setRedirectionLinks(redirectionLinks.push(newLink))
        setPopoverOpen(!popoverOpen)
    }

    const closePopup = () => {
        setPopoverOpen(!popoverOpen)
    }

    const handleCanAdd = (value: string, isTitle: boolean) => {
        const toCheck = isTitle ? redirectionLinkTitle : redirectionLinkUrl
        const trimmedValue = value.trim()
        const trimmedToCheck = toCheck.trim()

        if (
            trimmedValue &&
            trimmedValue.length > 0 &&
            trimmedToCheck &&
            trimmedToCheck.length > 0
        ) {
            setCanAdd(true)
        } else {
            setCanAdd(false)
        }
    }

    const handleLinkTitleChange = (value: string) => {
        setRedirectionLinkTitle(value)
        handleCanAdd(value, true)
    }

    const handleLinkUrlChange = (value: string) => {
        setRedirectionLinkUrl(value)
        handleCanAdd(value, false)
    }

    return {
        redirectionLinks,
        popoverOpen,
        collapseOpen,
        togglePopup,
        toggleCollapse,
        handleSubmit,
        closePopup,
        handleLinkTitleChange,
        handleLinkUrlChange,
        canAdd,
    }
}
