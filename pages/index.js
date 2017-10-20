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
                <Editor
                    content={this.props.markdown}
                    language={{
                        name: 'markdown',
                        toHtml: marked,
                        lineSafeInsert: (line, content) => {
                            // if contains link, insert not to break href
                            if(line.match(/.*\[.*\]\s*\(.*\).*/)) {
                                const segments = line.split(')');
                                segments[segments.length-1] += content;
                                return segments.join(')');
                            }
                            // else append to any word
                            return line.replace(/(.*)(\w)(.*)/,`$1$2${content}$3`);
                        }
                    }}
                    width={1800}
                    height={850} />
            </div>
        );
    }
}
