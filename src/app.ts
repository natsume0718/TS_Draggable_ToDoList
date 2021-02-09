function autobind(
    _: any,
    _2: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this)
        }
    }
    return adjDescriptor;
}


class ProjectInput {
    templateEl: HTMLTemplateElement;
    hostEl: HTMLElement;
    element: HTMLElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    mandyInputElement: HTMLInputElement;

    constructor() {
        this.templateEl = document.querySelector('#project-input')! as HTMLTemplateElement;
        this.hostEl = document.querySelector('#app')! as HTMLElement;

        // template内を複製
        const importedNode = document.importNode(this.templateEl.content, true);
        // 最初の子要素で初期化
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = 'user-input';
        this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement
        this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement
        this.mandyInputElement = this.element.querySelector('#mandy')! as HTMLInputElement

        this.configure();
        this.attach();
    }

    @autobind
    private submitFunc(event: Event) {
        event.preventDefault();
        console.log(this.titleInputElement.value)
    }

    private configure() {
        this.element.addEventListener('submit', this.submitFunc)
    }

    private attach() {
        this.hostEl.insertAdjacentElement('beforebegin', this.element);
    }
}

new ProjectInput();
