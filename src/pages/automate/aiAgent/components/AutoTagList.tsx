import React from 'react'
import {Button} from 'reactstrap'
import {cloneDeep} from 'lodash'
import {Tag} from 'models/aiAgent/types'
import {AutoTagItem} from './AutoTagInput'
import css from './AutoTagList.less'

interface IProps {
    tags: Tag[]
    onTagUpdate: (tags: Tag[]) => void
}

export function AutoTagList(props: IProps) {
    const {tags, onTagUpdate} = props
    return (
        <div>
            {!!tags.length && (
                <div className={css.autoTagListHeaders}>
                    <span>Tag name</span>
                    <span>Tag description</span>
                </div>
            )}

            {tags.map((tag, index) => (
                <div key={index} className={css.rowWrapper}>
                    <AutoTagItem
                        inputKey="name"
                        value={tag.name}
                        onInputUpdate={(value) => {
                            // This is specific to the usage of lodash. I did not find something to get around it
                            // eslint-disable-next-line @typescript-eslint/unbound-method
                            const newItems = tags.map(cloneDeep)
                            newItems[index].name = value
                            onTagUpdate(newItems)
                        }}
                        placeholder={'eg. discount'}
                    />

                    <AutoTagItem
                        inputKey="description"
                        value={tag.description}
                        onInputUpdate={(value) => {
                            // eslint-disable-next-line @typescript-eslint/unbound-method
                            const newItems = tags.map(cloneDeep)
                            newItems[index].description = value
                            onTagUpdate(newItems)
                        }}
                        placeholder={'eg. discount or promo code inquiries'}
                    />
                    <i
                        className="material-icons"
                        onClick={() => {
                            // eslint-disable-next-line @typescript-eslint/unbound-method
                            const newItems = tags.map(cloneDeep)
                            newItems.splice(index, 1)
                            onTagUpdate(newItems)
                        }}
                    >
                        delete
                    </i>
                </div>
            ))}
            <Button
                className={'d-flex align-items-center'}
                style={{marginTop: 16}}
                size="sm"
                onClick={() => {
                    onTagUpdate([...tags, {name: '', description: ''}])
                }}
            >
                <i className="material-icons md-2">add</i>
                <span>Add a tag</span>
            </Button>
        </div>
    )
}
