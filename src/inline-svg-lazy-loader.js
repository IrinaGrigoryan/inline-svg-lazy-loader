export default class InlineSvgLazyLoader {
    constructor(selector = 'js-lazy-inline-svg', options = null) {
        this.selector = selector;
        this.options = options || {
            loadingClass: 'js-svg-loading',
        }
        this.observerOptions = {
            threshold: [0.1]
        };

        this.init();
    }

    /**
     * Init plugin
     */
    init() {
        this.elements = [...document.querySelectorAll(`.${this.selector}`)];

        if (!this.elements.length) {
            return;
        }

        this.elements.forEach(element => {
            this.addInlineSvgObserver(element);
        });
    }

    /**
     * Add observer for inline svg
     * @param {HTMLElement} element - image element
     */
    addInlineSvgObserver(element) {
        const svgObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const { isIntersecting, target } = entry;
                if (isIntersecting) {
                    this.getSvg(target);
                    svgObserver.unobserve(target);
                }
            });
        }, this.observerOptions);

        svgObserver.observe(element);
    }

    /**
     * Get external or internal SVG
     * @param {HTMLElement} imageEl - image element
     */
    async getSvg(imageEl) {
        const { src } = imageEl.dataset;
        const { loadingClass } = this.options;

        imageEl.classList.add(loadingClass);

        try {
            const response = await fetch(src);

            if (response.ok) {
                const resultSvg = await response.text();

                this.replaceImgWithSvg(resultSvg, imageEl);
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Replace image with SVG
     * @param {string} svgString - SVG string
     * @param {HTMLElement} imageEl - image element
     */
    replaceImgWithSvg(svgString, imageEl) {
        const inlineSvg = this.parseSvgStringToHtml(svgString);
        this.removeAttrs(inlineSvg, imageEl);
        this.removeScripts(inlineSvg, imageEl);
        this.addAttrs(inlineSvg, imageEl);
        this.setSvgSize(inlineSvg, imageEl);

        if (imageEl.parentNode) {
            imageEl.parentNode.replaceChild(inlineSvg, imageEl);
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
     * @param {SVGSVGElement} svg - SVG element
     * @param {HTMLElement} imageEl - image element
     */
    removeAttrs(svg, imageEl) {
        const { removeAttrs } = imageEl.dataset;

        if (removeAttrs) {
            const attrsArray = removeAttrs.split(',');

            attrsArray.forEach(attr => {
                const attrName = attr.trim();
                svg.removeAttribute(attrName);
            });
        }
    }

    /**
     * Set additional attributes for SVG
     * @param {SVGSVGElement} svg - SVG element
     * @param {HTMLElement} imageEl - image element
     */
    addAttrs(svg, imageEl) {
        const { addAttrs } = imageEl.dataset;

        if (addAttrs) {
            const attrsWithoutExtraSymbols = /([\w\d\-\s*]+):\s*[\w\d\-\s*]+/g;
            const attrsArray = addAttrs.match(attrsWithoutExtraSymbols);

            attrsArray.forEach(attr => {
                const [attrName, attrValue] = attr.split(':');
                svg.setAttribute(attrName.trim(), attrValue.trim());
            });
        }
    }

    /**
     * Set SVG size from img data attributes
     * @param {SVGSVGElement} svg - SVG element
     * @param {HTMLElement} imageEl - image element
     */
    setSvgSize(svg, imageEl) {
        const { setSvgSize } = imageEl.dataset;

        if (setSvgSize) {
            svg.setAttribute('width', imageEl.width);
            svg.setAttribute('height', imageEl.height);
        }
    }

    /**
     * Remove JS scripts from SVG
     * @param {SVGSVGElement} svg - SVG element
     * @param {HTMLElement} imageEl - image element
     */
    removeScripts(svg, imageEl) {
        const { removeScripts } = imageEl.dataset;

        if (removeScripts) {
            const scriptsArray= svg.querySelectorAll('script');
            const svgAttrs = svg.getAttributeNames();

            scriptsArray.forEach(script => {
                script.remove();
            });

            if (svgAttrs) {
                const attrsStartedFromOn = /^on\w*/i;

                svgAttrs.forEach(attr => {
                    if (attr.match(attrsStartedFromOn)) {
                        svg.removeAttribute(attr);
                    }
                });
            }
        }
    }
}

if (typeof window !== 'undefined') {
    window.InlineSvgLazyLoader = InlineSvgLazyLoader;
}
