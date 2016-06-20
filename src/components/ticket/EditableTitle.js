import React, {PropTypes} from 'react'

export default class EditableTitle extends React.Component {
    componentDidMount() {
        if (this.props.focus) {
            this.toggleEditMode()
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.focus && nextProps.focus) {
            this.toggleEditMode()
        }
    }

    onKeyDown(e) {
        if (e.keyCode === 13) {
            e.preventDefault()
        }
    }

    onKeyUp(e) {
        if (e.keyCode === 13 || e.keyCode === 27) {
            e.preventDefault()

            this.reinitTitle(this.refs.title)

            if (e.keyCode === 13) {
                this.refs.title.blur()
            } else {
                this.refs.title.innerText = this.props.title
            }
        }
    }

    onBlur() {
        const titleObject = this.refs.title
        this.reinitTitle(titleObject)
        this.props.update(titleObject.innerText)
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
        const {title, placeholder} = this.props
        return (
            <h1 id="title"
                ref="title"
                tabIndex="1"
                placeholder={placeholder}
                className="ui header EditableTitle"
                onClick={() => this.toggleEditMode()}
                onKeyDown={(e) => this.onKeyDown(e)}
                onKeyUp={(e) => this.onKeyUp(e)}
                onBlur={(e) => this.onBlur(e)}
            >{title}</h1>
        )
    }

}

EditableTitle.propTypes = {
    title: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    update: PropTypes.func.isRequired,
    focus: PropTypes.bool
}
