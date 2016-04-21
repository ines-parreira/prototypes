import React, { PropTypes } from 'react'

export default class EditableTitle extends React.Component {
    onKeyDown(e) {
        if (e.keyCode === 13) {
            e.preventDefault()
        }
    }

    onKeyUp(e) {
        if (e.keyCode === 13 || e.keyCode === 27) {
            e.preventDefault()

            const subjectObject = this.refs.title
            this.reinitTitle(subjectObject)

            if (e.keyCode === 13) {
                this.refs.title.blur()
            } else {
                subjectObject.innerText = this.props.title
            }
        }
    }

    onBlur() {
        const titleObject = this.refs.title
        this.reinitTitle(titleObject)
        this.props.updateMethod(titleObject.innerText)
    }

    reinitTitle(subjectObject) {
        subjectObject.classList.remove('edit-mode')
        subjectObject.setAttribute('contentEditable', 'false')
    }

    toggleEditMode = () => {
        const subjectObject = this.refs.title

        subjectObject.classList.add('edit-mode')
        subjectObject.setAttribute('contentEditable', 'true')
        subjectObject.focus()
    }

    render() {
        const { title, placeholder } = this.props
        return (
            <h1
                id="title"
                ref="title"
                placeholder={placeholder}
                className="ui header EditableTitle"
                onClick={() => this.toggleEditMode()}
                onKeyDown={(e) => this.onKeyDown(e)}
                onKeyUp={(e) => this.onKeyUp(e)}
                onBlur={(e) => this.onBlur(e)}
            >
                {title}
            </h1>
        )
    }

}

EditableTitle.propTypes = {
    title: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    updateMethod: PropTypes.func.isRequired
}
