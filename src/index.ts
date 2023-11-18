import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeSanitize from 'rehype-sanitize'

export default class MarkdownElement extends HTMLElement {
  private remark = MarkdownElement.createRemark()
  static readonly INITIAL_TAG_NNAME = 'markdown'
  constructor() {
    super()
  }

  static install() {
    const t = MarkdownElement.INITIAL_TAG_NNAME
    customElements.get(t) || customElements.define(t, MarkdownElement)
  }
  static createElement() {
    return document.createElement(
      MarkdownElement.INITIAL_TAG_NNAME
    ) as MarkdownElement
  }

  private static createRemark() {
    return unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
  }

  update() {
    const shadow = this.shadowRoot!
    const source = this.innerHTML
    const html = this.remark.processSync(source).toString()
    shadow.innerHTML = html
  }

  private observer = new MutationObserver((mutations) => {
    console.info('[MarkdownRender]', 'MutationObserver:', mutations)
    this.update()
  })

  // 首次插入到 DOM 时调用
  connectedCallback() {
    console.info('[MarkdownRender]', 'connectedCallback:', this)
    this.attachShadow({ mode: 'open' })
    this.update()
    this.observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
    })
  }

  // 参数变化时调用
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    console.info('[MarkdownRender]', 'attributeChangedCallback:', {
      name,
      oldValue,
      newValue,
    })
  }

  disconnectedCallback() {
    console.info('[MarkdownRender]', 'disconnectedCallback:', this)
    this.observer && this.observer.disconnect()
  }
}

MarkdownElement.install()

export const createMarkdownElement =
  MarkdownElement.createElement.bind(MarkdownElement)
