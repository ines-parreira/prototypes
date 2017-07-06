import React from 'react'
import classnames from 'classnames'
import {Entity} from 'draft-js'
import {UncontrolledTooltip} from 'reactstrap'

import {linkify} from '../../../../../utils'

import * as integrationsHelpers from '../../../../../state/integrations/helpers'

// documentation: https://github.com/draft-js-plugins/draft-js-plugins/blob/master/HOW_TO_CREATE_A_PLUGIN.md

// VARIABLE
export const variable = {
    strategy: (contentBlock, callback) => {
        contentBlock.findEntityRanges(
            (character) => {
                const entityKey = character.getEntity()
                return entityKey !== null && Entity.get(entityKey).getType() === 'variable'
            }, callback
        )
    },
    component: ({children, entityKey}) => { // eslint-disable-line
        const entity = Entity.get(entityKey).getData()
        const {fullName, type} = entity

        let title = fullName

        if (type) {
            const config = integrationsHelpers.getIntegrationConfig(type)
            title = `${config.title}: ${title}`
        }

        return (
            <div
                className="d-inline-block align-middle"
                title={title}
            >
                <div
                    className={classnames('badge-variable', {
                        [`badge-variable-type-${type}`]: !!type,
                    })}
                    contentEditable={false}
                >
                    {
                        !!type && (
                            <img
                                className="badge-variable-icon"
                                src={integrationsHelpers.getIconFromType(type)}
                            />
                        )
                    }
                    {fullName}
                </div>
                <div
                    className="hidden"
                >
                    {children}
                </div>
            </div>
        )
    },
}

// LINK
export const link = {
    strategy: (contentBlock, callback) => {
        contentBlock.findEntityRanges(
            (character) => {
                const entityKey = character.getEntity()
                return entityKey !== null && Entity.get(entityKey).getType() === 'link'
            }, callback
        )
    },
    component: ({children, entityKey}) => { // eslint-disable-line
        const entity = Entity.get(entityKey).getData()
        const {url} = entity
        const id = `link-${entityKey}`
        return (
            <a
                href={url}
                id={id}
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
                <UncontrolledTooltip
                    placement="top"
                    target={id}
                    delay={0}
                >
                    {url}
                </UncontrolledTooltip>
            </a>
        )
    },
}

// URL FOUND IN TEXT
export const foundUrl = {
    strategy: (contentBlock, callback) => {
        const links = linkify.match(contentBlock.get('text'))

        if (!links) {
            return
        }

        links.forEach(link => callback(link.index, link.lastIndex))
    },
    component: ({decoratedText, children}) => { // eslint-disable-line
        const links = linkify.match(decoratedText)
        const url = links && links[0] ? links[0].url : ''
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        )
    }
}

export default [variable, link, foundUrl]
