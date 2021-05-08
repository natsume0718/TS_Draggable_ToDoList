namespace App {
  class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
      this.listeners.push(listenerFn);
    }

  }

  type Listener<T> = (items: T[]) => void;

  // state manager
  export class ProjectState extends State<Project> {
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
      this.updateListeners();
    }

    changeProjectState(projectId: string, newStatus: ProjectStatus) {
      const proj = this.projects.find(prj => prj.id === projectId);
      if (proj && proj.status !== newStatus) {
        proj.status = newStatus;
        this.updateListeners();
      }
    }

    private updateListeners() {
      for (const listenerFn of this.listeners) {
        listenerFn(this.projects.slice());
      }
    }
  }

  export const projectState = ProjectState.getInstance();

}
