export default class InlineSvgLazyLoader {
    /**
     * Create InlineSvgLazyLoader instance.
     * @param {(String|HTMLElement)} element - element to initialize plugin
     * @param {Object} options - plugin options
     */
    constructor(element = 'js-lazy-inline-svg', options = null) {
        this.element = element;
        this.inlineSvg = null;
        this.options = options || {
            loadingClass: 'js-svg-loading',
        }
        this.observerOptions = {
            threshold: [0.1]
        };

        this.checkBeforeInit();
    }

    /**
     * Check before initializing plugin
     */
    checkBeforeInit() {
        if (typeof this.element === 'string') {
            const elements = [...document.querySelectorAll(`.${this.element}`)];

            if (elements) {
                elements.forEach(el => new InlineSvgLazyLoader(el, this.options));
            }
        } else {
            this.init();
        }
    }

    /**
     * Init plugin
     */
    init() {
        this.addInlineSvgObserver();
    }

    /**
     * Add observer for image
     */
    addInlineSvgObserver() {
        const svgObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const { isIntersecting } = entry;
                if (isIntersecting) {
                    this.getSvg();
                    svgObserver.unobserve(this.element);
                }
            });
        }, this.observerOptions);

        svgObserver.observe(this.element);
    }

    /**
     * Get external or internal SVG
     */
    async getSvg() {
        const { src } = this.element.dataset;
        const { loadingClass } = this.options;

        this.element.classList.add(loadingClass);

        try {
            const response = await fetch(src);

            if (response.ok) {
                const resultSvg = await response.text();

                this.inlineSvg = this.parseSvgStringToHtml(resultSvg);
                this.replaceImgWithSvg();
            }
        } catch (error) {
            console.error(error);
        } finally {
            this.element.classList.remove(loadingClass);
        }
    }

    /**
     * Replace image with SVG
     */
    replaceImgWithSvg() {
        this.removeAttrs();
        this.removeScripts();
        this.addAttrs();
        this.setSvgSize();

        if (this.element.parentNode) {
            this.element.parentNode.replaceChild(this.inlineSvg, this.element);
        }
    }

    /**
     * Parse SVG string to HTML
     * @param {string} svgString - SVG string
     */
    parseSvgStringToHtml(svgString) {
        const parser = new DOMParser();
        const html = parser.parseFromString(svgString, 'text/html');
        return html.querySelector('svg');
    }

    /**
     * Remove extra attributes from SVG
     */
    removeAttrs() {
        const { removeAttrs } = this.element.dataset;

        if (removeAttrs) {
            const attrsArray = removeAttrs.split(',');

            attrsArray.forEach(attr => {
                const attrName = attr.trim();
                this.inlineSvg.removeAttribute(attrName);
            });
        }
    }

    /**
     * Set additional attributes for SVG
     */
    addAttrs() {
        const { addAttrs } = this.element.dataset;

        if (addAttrs) {
            const attrsWithoutExtraSymbols = /([\w\d\-\s*]+):\s*[\w\d\-\s*]+/g;
            const attrsArray = addAttrs.match(attrsWithoutExtraSymbols);

            attrsArray.forEach(attr => {
                const [attrName, attrValue] = attr.split(':');
                this.inlineSvg.setAttribute(attrName.trim(), attrValue.trim());
            });
        }
    }

    /**
     * Set SVG size from img data attributes
     */
    setSvgSize() {
        const { setSvgSize } = this.element.dataset;

        if (setSvgSize) {
            ['width', 'height'].forEach(size => {
                this.inlineSvg.setAttribute(size, this.element[size]);
            });
        }
    }

    /**
     * Remove JS scripts from SVG
     */
    removeScripts() {
        const { removeScripts } = this.element.dataset;

        if (removeScripts) {
            const scriptsArray= this.inlineSvg.querySelectorAll('script');
            const svgAttrs = this.inlineSvg.getAttributeNames();

            scriptsArray.forEach(script => {
                script.remove();
            });

            if (svgAttrs) {
                const attrsStartedFromOn = /^on\w*/i;

                svgAttrs.forEach(attr => {
                    if (attr.match(attrsStartedFromOn)) {
                        this.inlineSvg.removeAttribute(attr);
                    }
                });
            }
        }
    }
}

if (typeof window !== 'undefined') {
    window.InlineSvgLazyLoader = InlineSvgLazyLoader;
}
