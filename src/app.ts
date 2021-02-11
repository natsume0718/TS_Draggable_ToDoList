enum ProjectStatus {
    Active, Finished
}

type Listener = (items: Project[]) => void;

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public manday: number,
        public status: ProjectStatus
    ) {

    }
}

// state manager
class State {
    private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: State;

    private constructor() {
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new State();
        return this.instance;
    }

    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }

    addProject(title: string, description: string, manday: number) {
        this.projects.push(new Project(Math.random().toString(), title, description, manday, ProjectStatus.Active));
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = State.getInstance();

// validation
interface Validatable {
    value: number | string,
    required?: boolean,
    minLength?: number,
    maxLength?: number,
    min?: number,
    max?: number
}

function validate(obj: Validatable) {
    let isValid = true;
    if (obj.required) {
        isValid = isValid && obj.value.toString().trim().length !== 0;
    }
    if (obj.minLength !== undefined) {
        if (typeof obj.value === 'number') {
            isValid = isValid && obj.minLength < obj.value
        }
        if (typeof obj.value === 'string') {
            isValid = isValid && obj.minLength < obj.value.length;
        }
    }
    if (obj.maxLength !== undefined) {
        if (typeof obj.value === 'number') {
            isValid = isValid && obj.maxLength > obj.value;
        }
        if (typeof obj.value === 'string') {
            isValid = isValid && obj.maxLength > obj.value.length;
        }
    }

    if (obj.min !== undefined) {
        if (typeof obj.value === 'number') {
            isValid = isValid && obj.min < obj.value;
        }
    }
    if (obj.max !== undefined) {
        if (typeof obj.value === 'number') {
            isValid = isValid && obj.max < obj.value;
        }
    }
    return isValid;
}

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



class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: any[] = []

    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
        this.assignedProjects = [];

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;

        projectState.addListener((projects: Project[]) => {
            this.assignedProjects = projects;
            this.renderProjects();
        });
        this.attach();
        this.renderContent();
    }

    private renderProjects() {
        const li = document.getElementById(`${this.type}-projects`) as HTMLUListElement;
        for (const prj of this.assignedProjects) {
            const item = document.createElement('li');
            item.textContent = prj.title;
            li.appendChild(item);
        }
    }

    private renderContent() {
        this.element.querySelector('ul')!.id = `${this.type}-projects-list`;
        this.element.querySelector('h2')!.textContent =
            this.type === 'active' ? '実行中プロジェクト' : '完了プロジェクト';
    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
}


class ProjectInput {
    templateEl: HTMLTemplateElement;
    hostEl: HTMLElement;
    element: HTMLElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    mandayInputElement: HTMLInputElement;

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
        this.mandayInputElement = this.element.querySelector('#manday')! as HTMLInputElement

        this.configure();
        this.attach();
    }

    private gatherInputs(): [string, string, number] | void {
        const title = this.titleInputElement.value;
        const desc = this.descriptionInputElement.value;
        const man = this.mandayInputElement.value;
        if (!validate({value: title, required: true, minLength: 2}) ||
            !validate({value: desc, required: true, minLength: 2}) ||
            !validate({value: man, required: true, min: 0, max: 100})
        ) {
            alert('入力値が正しくありません');
            return;
        }
        return [title, desc, +man]
    }


    private clearInput() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.mandayInputElement.value = '';
    }


    @autobind
    private submitFunc(event: Event) {
        event.preventDefault();

        const userInput = this.gatherInputs()
        if (Array.isArray(userInput)) {
            const [title, desc, man] = userInput;
            this.clearInput();
            projectState.addProject(title, desc, man);
        }
    }

    private configure() {
        this.element.addEventListener('submit', this.submitFunc)
    }

    private attach() {
        this.hostEl.insertAdjacentElement('beforebegin', this.element);
    }
}

new ProjectInput();
new ProjectList('active');
new ProjectList('finished');
