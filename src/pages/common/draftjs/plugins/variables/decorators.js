import React from 'react'
import classnames from 'classnames'

import {setVariableEditable} from './utils'

import * as integrationsHelpers from '../../../../../state/integrations/helpers'

// VARIABLE
export const variable = {
    strategy: (contentBlock, callback, contentState) => {
        contentBlock.findEntityRanges(
            (character) => {
                const entityKey = character.getEntity()
                return entityKey !== null && contentState.getEntity(entityKey).getType() === 'variable'
            }, callback
        )
    },
    component: ({offsetKey, children, entityKey, getEditorState, contentState, setEditorState}) => { // eslint-disable-line
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
                setEditorState
            })
        }

        if (!immutable) {
            return (
                <span className="d-inline text-primary">
                    {children}
                </span>
            )
        }

        return (
            <div
                className="d-inline-block align-middle"
                title={title}
            >
                <div
                    className={classnames('badge-variable', {
                        [`badge-variable-type-${type}`]: entityIsIntegration,
                    })}
                    contentEditable={false}
                >
                    <div onDoubleClick={_makeVariableEditable}>
                        <span className="badge-variable-content">
                            {
                                entityIsIntegration && (
                                    <img
                                        className="badge-variable-icon"
                                        src={integrationsHelpers.getIconFromType(type)}
                                    />
                                )
                            }
                            {fullName}
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
                <div
                    className="hidden"
                >
                    {children}
                </div>
            </div>
        )
    },
}

export default [variable]
