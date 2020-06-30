import React from 'react'
import classnames from 'classnames'

import * as integrationsHelpers from '../../../../../state/integrations/helpers'

import {setVariableEditable} from './utils'

const placeholderRender = (entity) => {
    const {fullName, type, integration} = entity
    const entityIsIntegration = type && integration

    if (entityIsIntegration) {
        return (
            <span>
                <img
                    alt="integration icon"
                    className="badge-variable-icon"
                    src={integrationsHelpers.getIconFromType(type)}
                />
                {fullName}
            </span>
        )
    }

    if (type === 'survey') {
        return (
            <span>
                <i className="material-icons">star_rate</i>
                <i className="material-icons">star_rate</i>
                <i className="material-icons">star_rate</i>
                <i className="material-icons">star_rate</i>
                <i className="material-icons">star_rate</i>
            </span>
        )
    }

    return fullName
}

// VARIABLE
export const variable = {
    strategy: (contentBlock, callback, contentState) => {
        contentBlock.findEntityRanges((character) => {
            const entityKey = character.getEntity()
            return (
                entityKey !== null &&
                contentState.getEntity(entityKey).getType() === 'variable'
            )
        }, callback)
    },
    component: ({
        offsetKey, // eslint-disable-line react/prop-types
        children, // eslint-disable-line react/prop-types
        entityKey, // eslint-disable-line react/prop-types
        getEditorState, // eslint-disable-line react/prop-types
        contentState, // eslint-disable-line react/prop-types
        setEditorState, // eslint-disable-line react/prop-types
    }) => {
        const entity = contentState.getEntity(entityKey).getData()
        const {fullName, type, integration, immutable} = entity
        const entityIsIntegration = type && integration
        let title = fullName

        if (entityIsIntegration) {
            const config = integrationsHelpers.getIntegrationConfig(type)
            title = `${config.title}: ${title}`
        }

        const _preventDefault = (e) => {
            // don't steal focus when clicking the edit button
            e.preventDefault()
        }

        const _makeVariableEditable = (e) => {
            _preventDefault(e)

            return setVariableEditable({
                entityKey,
                offsetKey,
                getEditorState,
                setEditorState,
            })
        }

        if (!immutable) {
            return <span className="d-inline text-primary">{children}</span>
        }

        return (
            <div className="d-inline-block align-middle" title={title}>
                <div
                    className={classnames(
                        'badge-variable',
                        `badge-variable-type-${type}`
                    )}
                    contentEditable={false}
                >
                    <div onDoubleClick={_makeVariableEditable}>
                        <span className="badge-variable-content">
                            {placeholderRender(entity)}
                        </span>
                    </div>
                    <button
                        type="button"
                        title="Edit variable"
                        className="variable-edit-btn btn btn-sm"
                        onClick={_makeVariableEditable}
                        onMouseDown={_preventDefault}
                    >
                        <i className="material-icons">create</i>
                    </button>
                </div>
                <div className="hidden">{children}</div>
            </div>
        )
    },
}

export default [variable]
