import Project from './project';

class Session {
    constructor() {
        this.load();
    }

    load() {
        const storedProjects = localStorage.getItem('projects');
        this.projects = storedProjects ? JSON.parse(storedProjects) : [];
    }

    store() {
        localStorage.setItem('projects', JSON.stringify(this.projects));
    }

    createProject(name) {
        const project = new Project(name, crypto.randomUUID());
        this.projects.push(project);
        this.store();
        return project.uuid;
    }

    renameProject(uuid, newName) {
        const project = this.getProject(uuid);
        if (project) {
            project.name = newName;
            this.store();
        }
    }

    deleteProject(uuid) {
        this.projects = this.projects.filter(project => project.uuid !== uuid);
        this.store();
    }

    getProject(uuid) {
        return this.projects.find(project => project.uuid === uuid);
    }
}

export default Session;
