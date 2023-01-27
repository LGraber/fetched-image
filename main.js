class FetchedImage extends HTMLElement {
    static headersFunction = null;

    static get observedAttributes() {
        return ['src', 'width', 'height'];
    }

    constructor() {
        super();

        this.connected = false;

        const shadow = this.attachShadow({mode: 'open'});
        const img = document.createElement('img');
        shadow.appendChild(img);
    }

    connectedCallback() {
        console.log('fetched-image connected');
        this.connected = true;
        this.fetchImage();
    }

    disconnectedCallback() {
        this.connected = false;
        FetchedImage.revokeImageObjectUrl(this);
    }

    attributeChangedCallback(name, oldValue, newValue){
        console.log('fetched-image attribute changed');
        if (oldValue != newValue) {
            if (name == 'src') {
                FetchedImage.revokeImageObjectUrl(this);
            }
            this.fetchImage();
        }
    }

    get src() {
        return this.getAttribute('src');
    }

    set src(value) {
        FetchedImage.setAttributeValue('src', value);
    }

    get width() {
        return this.getAttribute('width');
    }

    set width(value) {
        FetchedImage.setAttributeValue(this, 'width', value);
    }

    get height() {
        return this.getAttribute('height');
    }

    set height(value) {
        FetchedImage.setAttributeValue(this, 'height', value);
    }

    static setAttributeValue(elem, name, value) {
        if (!value) {
            elem.removeAttribute(name);
        } else {
            elem.setAttribute(name, value);
        }
    }

    static revokeImageObjectUrl(elem) {
        const img = elem.shadowRoot.querySelector('img');
        if (img.src) {
            URL.revokeObjectURL(img.src);
        }
    }

    static set fetchHeadersFunction(value) {
        FetchedImage.headersFunction = value;
    }

    static fetchHeaders() {
        return {'X-Foo': 'bar'};
    }

    async fetchImage() {
        if (this.connected) {
            if (this.src) {
                let resp;
                if (FetchedImage.headersFunction) {
                    resp = await fetch(this.src, { headers: FetchedImage.headersFunction() });
                } else {
                    resp = await fetch(this.src);
                }
                const blob = await resp.blob();
                const blobUrl = URL.createObjectURL(blob);
                let img = this.shadowRoot.querySelector('img');
                if (this.height) {
                    img.height = this.height;
                }
                if (this.width) {
                    img.width = this.width;
                }
                img.src = blobUrl;
            } else {
                this.shadowRoot.querySelector('img').src = null;
            }
        }
    }
}

customElements.define('fetched-image', FetchedImage);
