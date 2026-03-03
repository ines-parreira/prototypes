import type { ReactNode, SyntheticEvent } from 'react'
import React from 'react'

import classnames from 'classnames'
import type { ContentBlock, ContentState } from 'draft-js'

import type { IntegrationType } from 'models/integration/constants'
import type { Variable } from 'tickets/common/config'

import * as integrationsHelpers from '../../../../../state/integrations/helpers'
import type {
    DecoratorComponentProps,
    DecoratorStrategyCallback,
} from '../types'
import { setVariableEditable } from './utils'

type Entity = Variable & {
    immutable: boolean
    result: string
}

const placeholderRender = (entity: Entity): ReactNode => {
    const { fullName, type, integration } = entity
    const entityIsIntegration = type && integration

    if (entityIsIntegration) {
        return (
            <span>
                <img
                    alt="integration icon"
                    className="badge-variable-icon"
                    src={integrationsHelpers.getIconFromType(
                        type as IntegrationType,
                    )}
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
    strategy: (
        contentBlock: ContentBlock,
        callback: DecoratorStrategyCallback,
        contentState: ContentState,
    ) => {
        contentBlock.findEntityRanges((character) => {
            const entityKey = character.getEntity()
            return (
                entityKey !== null &&
                contentState.getEntity(entityKey).getType() === 'variable'
            )
        }, callback)
    },
    component: (props: DecoratorComponentProps) => {
        const { contentState, entityKey, children } = props
        const entity: Entity = contentState.getEntity(entityKey).getData()
        const { fullName, type, integration, immutable } = entity
        const entityIsIntegration = type && integration
        let title = fullName as string

        if (entityIsIntegration) {
            const config = integrationsHelpers.getIntegrationConfig(
                type as IntegrationType,
            )
            title = `${config!.title}: ${title}`
        }

        const _preventDefault = (e: SyntheticEvent) => {
            // don't steal focus when clicking the edit button
            e.preventDefault()
        }

        const _makeVariableEditable = (e: SyntheticEvent): any => {
            _preventDefault(e)

            return setVariableEditable(props)
        }

        if (!immutable) {
            return <span className="d-inline text-primary">{children}</span>
        }

        return (
            <div className="d-inline-block align-middle" title={title}>
                <div
                    className={classnames(
                        'badge-variable',
                        `badge-variable-type-${type}`,
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

const variableDecorators = [variable]

export default variableDecorators
