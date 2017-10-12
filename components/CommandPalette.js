import PropTypes from 'prop-types';

const ARROW_UP = 38;
const ARROW_DOWN = 40;
const ESCAPE = 27;

const COLOR = '#e67e22';

class CommandPalette extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.hide = this.hide.bind(this);
        this.focus = this.focus.bind(this);
        this.state = {
            value: '',
            selected: 0,
            show: Object.keys(this.props.options),
            visible: false,
        };
    }
    static propTypes = {
        options: PropTypes.object,
        onSelected: PropTypes.func,
    }
    static defaultProps = {
        options: {
            affix: 'affix show', alert: 'alert show', anchor: 'anchor show', autocomplete: 'autocomplete show', avatar: 'avatar show', backtop: 'backtop show', badge: 'badge show', breadcrumb: 'breadcrumb show', button: 'button show', calendar: 'calendar show', card: 'card show', carousel: 'carousel show', cascader: 'cascader show', checkbox: 'checkbox show', col: 'col show', collapse: 'collapse show', datepicker: 'datepicker show', dropdown: 'dropdown show', form: 'form show', grid: 'grid show', icon: 'icon show', indexdts: 'indexdts show', indexjs: 'indexjs show', input: 'input show', inputnumber: 'inputnumber show', layout: 'layout show', localeprovider: 'localeprovider show', mention: 'mention show', menu: 'menu show', message: 'message show', modal: 'modal show', notification: 'notification show', pagination: 'pagination show', popconfirm: 'popconfirm show', popover: 'popover show', progress: 'progress show', radio: 'radio show', rate: 'rate show', row: 'row show', select: 'select show', slider: 'slider show', spin: 'spin show', steps: 'steps show', style: 'style show', switch: 'switch show', table: 'table show', tabs: 'tabs show', tag: 'tag show', timeline: 'timeline show', timepicker: 'timepicker show', tooltip: 'tooltip show', transfer: 'transfer show', tree: 'tree show', treeselect: 'treeselect show', upload: 'upload show', util: '_util show', version: 'version show',
        },
        onSelected: () => console.warn('No listener function for Command Palette'),
    }
    hide() {
        this.setState({
            ...this.state,
            visible: false,
            value: '',
            selected: 0,
            show: Object.keys(this.props.options),
        });
    }
    focus() {
        this.setState({
            ...this.state,
            visible: true,
        }, () => this.refs.input.focus());

    }
    handleChange(e) {
        const value = e.target.value;
        const show = Object.keys(this.props.options)
            .filter(
            optionKey => this.props.options[optionKey]
                .toLowerCase()
                .includes(value.toLowerCase())
            );
        this.setState({
            ...this.state,
            value,
            show,
            selected: 0,
        }, () => {
            const ul = document.querySelector('.command-palette ul');
            ul.scrollTop = 0;
        });
    }
    handleKeyPress(e) {
        let selected = this.state.selected;
        if (e.key === 'Enter') {
            this.props.onSelected(this.state.show[selected]);
            this.hide();
        }
    }
    handleKeyDown(e) {
        if (e.keyCode === ARROW_DOWN || e.keyCode === ARROW_UP) {
            let selected = this.state.selected;
            if (e.keyCode === ARROW_UP) {
                selected--;
            }
            else {
                selected++;
            }
            selected = (selected + this.state.show.length) % this.state.show.length;
            this.setState({
                ...this.state,
                selected,
            }, () => {
                console.log(this.state.show[selected]);
                const ul = document.querySelector('.command-palette ul');
                const li = document.querySelector('.command-palette li.selected');
                ul.scrollTop = li.offsetTop - (118 * 2);
            });
        }
        if(e.keyCode === ESCAPE) {
            this.hide();
        }
    }
    render() {
        return (
            <div style={{display: this.state.visible ? 'block': 'none'}} className="command-palette">
                <input ref="input" onChange={this.handleChange} onKeyDown={this.handleKeyDown} onKeyPress={this.handleKeyPress} value={this.state.value}></input>
                <ul>
                    {this.state.show
                        .map((optionKey, index) =>
                            <li className={index === this.state.selected ? 'selected' : ''} key={optionKey}>
                                {this.props.options[optionKey]}
                            </li>
                        )
                    }
                </ul>
                <style jsx>{`
                    .command-palette {
                        background-color: rgba(0,0,0,0.8);
                        color: #fff;
                        padding: 10px;
                        font-family: 'Roboto', sans-serif;
                        display: block;
                        position: absolute;
                        width: 50%;
                        z-index: 10;
                        box-sizing: border-box;
                        margin: auto;
                        left: 0;
                        right: 0;
                    }
                    input:focus {
                        outline: none;
                    }
                    input {
                        width: 100%;
                        border: 1px solid ${COLOR};
                        padding: 7px 23px;
                        background: none;
                        color: #fff;
                        margin-bottom: 5px;
                        font-size: 16px;
                        box-sizing: border-box;
                    }
                    .command-palette::before {
                        display: block;
                        content: ">";
                        position: absolute;
                        top: 15px;
                        left: 20px;
                        opacity: 0.5;
                    }
                    ul {
                        list-style-type: none;
                        padding-left: 0;
                        max-height: 300px;
                        width: 100%;
                        overflow: hidden;
                        margin-top: 11px;
                        line-height: 22px;
                        margin: 1px;
                        line-height: 20px;
                        box-sizing: border-box;
                    }
                    ul li {
                        box-sizing: border-box;
                        {/* background-color: orange; */}
                        margin: 3px 0;
                        padding: 0 8px;
                        font-size: 12px;
                    }
                    ul li.selected {
                        background-color: ${COLOR};
                    }
                `}</style>
            </div>
        );
    }
};

export default CommandPalette;