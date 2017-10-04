import Editor from '../components/Editor';
import fetch from 'isomorphic-fetch';
import marked from 'marked';

export default class extends React.Component {
    static async getInitialProps() {
        const res = await fetch(`https://daringfireball.net/projects/markdown/syntax.text`, {
            method: 'GET',
        });
        const markdown = await res.text();
        return {
            markdown,
        };
    }

    render() {
        return (
            <div>
                <h1>Markup editor</h1>
                <Editor content={this.props.markdown} language="markdown" toHtml={marked} />
            </div>
        );
    }
}