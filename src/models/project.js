import File from './file';

class Project {
    constructor(name, uuid) {
        this.name = name;
        this.uuid = uuid;
    }
}

class ProjectInner {
    constructor(uuid) {
        this.uuid = uuid;
        this.load();
        this.store();
    }

    load() {
        const storedProjectInner = localStorage.getItem(`projectInner_${this.uuid}`);
        this.files = storedProjectInner ? JSON.parse(storedProjectInner).files : [new File('entry.S', '')];
        this.config = storedProjectInner ? JSON.parse(storedProjectInner).config : {};
        this.items = storedProjectInner ? JSON.parse(storedProjectInner).items : [];
        this.decompiled = storedProjectInner ? JSON.parse(storedProjectInner).decompiled : '';
    }

    store() {
        localStorage.setItem(`projectInner_${this.uuid}`, JSON.stringify(this));
    }

    createFile(name, content = '') {
        const file = new File(name, content);
        this.files.push(file);
        this.store();
    }

    deleteFile(name) {
        this.files = this.files.filter(file => file.name !== name);
        this.store();
    }

    getFile(name) {
        return this.files.find(file => file.name === name);
    }

    updateFile(name, content) {
        const file = this.getFile(name);
        if (file) {
            file.content = content;
            this.store();
        }
    }
}

export { Project, ProjectInner };
