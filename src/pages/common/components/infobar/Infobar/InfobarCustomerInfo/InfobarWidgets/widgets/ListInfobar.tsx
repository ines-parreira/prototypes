import React, {Component, createContext} from 'react'
import classnames from 'classnames'
import {Map, List} from 'immutable'

import {compare} from 'utils'
import InfobarWidget from '../InfobarWidget.js'
import {ShowMore} from '../../ShowMore'

import css from './ListInfobarWidget.less'

type WidgetListContextType = {
    currentListIndex: number | null
}

export const WidgetListContext = createContext<WidgetListContextType>({
    currentListIndex: null,
})

const DEFAULT_LIST_LIMIT = 3

type OwnProps = {
    editing: Record<string | number, unknown>
    source: List<Map<string, unknown>>
    widget: Map<unknown, unknown>
    template: Map<unknown, unknown>
    isEditing?: boolean
    isParentList: boolean
    open?: boolean
}

class ListInfobarWidget extends Component<OwnProps> {
    state = {
        showMoreTimes: 0, // how many times the agent asked to show more of the list
    }

    render() {
        const {
            isEditing = false,
            isParentList,
            source,
            widget,
            template,
            editing,
        } = this.props

        const updatedTemplate = template.set(
            'absolutePath',
            (template.get('absolutePath') as List<string>).concat(['[]'])
        )

        const passedTemplate = (
            updatedTemplate.getIn(['widgets', '0']) as Map<unknown, unknown>
        ).set(
            'templatePath',
            `${updatedTemplate.get('templatePath', '') as string}.widgets.0`
        )

        const isParentOfCard =
            updatedTemplate.getIn(['widgets', 0, 'type'], '') === 'card'

        // if source data is not a list, don't try to display it as a list
        // it means incoming data does not have the expected shape
        if (!List.isList(source)) {
            return null
        }

        let orderedSource = source
        // order source
        const orderByConfig = template.getIn(['meta', 'orderBy']) as string

        if (!isEditing && orderByConfig) {
            // format of config : "-name" would tell order by 'name' DESC
            const orderByProperty = orderByConfig.slice(1)
            orderedSource = orderedSource.sort((a, b) =>
                compare(a.get(orderByProperty), b.get(orderByProperty))
            ) as List<Map<string, unknown>>

            const orderByDirection = orderByConfig.slice(0, 1)
            if (orderByDirection === '-') {
                orderedSource = orderedSource.reverse() as List<
                    Map<string, unknown>
                >
            }
        }

        let limit = template.getIn(['meta', 'limit']) || DEFAULT_LIST_LIMIT
        let sourceList = orderedSource
        let exclusionMessage = null

        // display only 1 element of the list if editing widgets
        if (isEditing) {
            limit = 1
        }

        // use limit only if we display cards in the list (display 1 element if list of lists)
        if (!isParentOfCard) {
            limit = 1
        }

        if (limit) {
            // calculate limit of cards displayed in this array
            limit = limit * (this.state.showMoreTimes + 1)
            // limit displayed source data
            sourceList = orderedSource.take(limit) as List<Map<string, unknown>>

            // if there is a limit, explain it under the card
            const excludedItems = source.size - limit
            const hasExcludedItems = excludedItems > 0

            if (hasExcludedItems) {
                exclusionMessage = isEditing ? (
                    `${excludedItems} more items`
                ) : (
                    <>
                        <ShowMore
                            onClick={() =>
                                this.setState({
                                    showMoreTimes: this.state.showMoreTimes + 1,
                                })
                            }
                        >
                            Show more
                        </ShowMore>
                        <span className={css.remaining}>
                            {excludedItems} remaining
                        </span>
                    </>
                )
            }
        }

        const className = classnames('list', {
            draggable: !isParentList,
        })

        if (!isEditing && !sourceList.size) {
            return null
        }

        return (
            <div
                className={className}
                data-key={`${template.get('path') as string}[]`}
            >
                {sourceList.map((d, i) => (
                    <WidgetListContext.Provider
                        value={{currentListIndex: i as number}}
                        key={i as number}
                    >
                        <InfobarWidget
                            source={d}
                            parent={updatedTemplate}
                            widget={widget}
                            template={passedTemplate}
                            editing={editing}
                            isEditing={isEditing}
                            open={i === 0}
                        />
                    </WidgetListContext.Provider>
                ))}
                {!sourceList.isEmpty() &&
                    isParentOfCard &&
                    exclusionMessage && (
                        <div className="footer clearfix">
                            {exclusionMessage}
                        </div>
                    )}
            </div>
        )
    }
}

export default ListInfobarWidget
