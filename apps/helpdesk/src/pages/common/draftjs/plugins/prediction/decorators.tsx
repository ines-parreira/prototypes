import type { ContentBlock, ContentState } from 'draft-js'

import type {
    Decorator,
    DecoratorComponentProps,
    DecoratorStrategyCallback,
} from '../types'

import css from './prediction.less'

export const prediction: Decorator = {
    strategy: (
        contentBlock: ContentBlock,
        callback: DecoratorStrategyCallback,
        contentState: ContentState,
    ) => {
        contentBlock.findEntityRanges((character) => {
            const entityKey = character.getEntity()
            return (
                entityKey !== null &&
                contentState.getEntity(entityKey).getType() === 'prediction'
            )
        }, callback)
    },
    component: (props: DecoratorComponentProps) => {
        const { contentState, entityKey } = props
        const entity = contentState.getEntity(entityKey).getData()
        const { text } = entity

        return (
            <span className={css.component} contentEditable={false}>
                {text}
            </span>
        )
    },
}

const predictionDecorators = [prediction]

export default predictionDecorators
