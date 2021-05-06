// drag and drop
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}


enum ProjectStatus {
    Active, Finished
}

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }

}

type Listener<T> = (items: T[]) => void;

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
class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super();
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    addProject(title: string, description: string, manday: number) {
        this.projects.push(new Project(Math.random().toString(), title, description, manday, ProjectStatus.Active));
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();

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

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;
        // template内を複製
        const importedNode = document.importNode(this.templateElement.content, true);
        // 最初の子要素で初期化
        this.element = importedNode.firstElementChild as U;
        if (newElementId !== undefined) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }

    private attach(insertToStart: boolean) {
        this.hostElement.insertAdjacentElement(insertToStart ? 'afterbegin' : 'beforeend', this.element);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    private project: Project;

    get manday() {
        const man = this.project.manday;
        if (this.project.manday < 20) {
            return man.toString() + '人日';
        }
        return (man / 20).toString() + '人月';
    }

    constructor(hostId: string, project: Project) {
        super("single-project", hostId, false, project.id);
        this.project = project;

        this.configure();
        this.renderContent();
    }

    dragStartHandler(event: DragEvent) {
        console.log(event)
    }

    dragEndHandler(_: DragEvent) {
        console.log('drag終了')
    }

    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragstart', this.dragEndHandler);
    }

    renderContent() {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.manday;
        this.element.querySelector('p')!.textContent = this.project.description;
    }
}


class ProjectList extends Component<HTMLDivElement, HTMLElement> {
    assignedProjects: any[] = []

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects`);
        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent =
            this.type === 'active' ? '実行中プロジェクト' : '完了プロジェクト';
    }


    configure() {
        projectState.addListener((projects: Project[]) => {
            const relevantProject = projects.filter(prj => {
                if (this.type === 'active') {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            })
            this.assignedProjects = relevantProject;
            this.renderProjects();
        });
    }

    private renderProjects() {
        const li = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
        li.innerHTML = '';
        for (const prj of this.assignedProjects) {
            new ProjectItem(li.id, prj);
        }
    }
}


class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    mandayInputElement: HTMLInputElement;

    constructor() {
        super('project-input', 'app', true, 'user-input');

        this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement
        this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement
        this.mandayInputElement = this.element.querySelector('#manday')! as HTMLInputElement

        this.configure();
    }

    configure() {
        this.element.addEventListener('submit', this.submitFunc)
    }

    renderContent() {

    }

    private gatherInputs(): [string, string, number] | void {
        const title = this.titleInputElement.value;
        const desc = this.descriptionInputElement.value;
        const man = this.mandayInputElement.value;
        if (!validate({ value: title, required: true, minLength: 2 }) ||
            !validate({ value: desc, required: true, minLength: 2 }) ||
            !validate({ value: man, required: true, min: 0, max: 100 })
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

}

new ProjectInput();
new ProjectList('active');
new ProjectList('finished');
