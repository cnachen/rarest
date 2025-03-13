import File from './file';

class Project {
    constructor(name, uuid, files = [], decompiled = '', config = {}, items = []) {
        this.name = name;
        this.uuid = uuid;
        this.files = files;
        this.decompiled = decompiled;
        this.config = config;
        this.items = items;
    }

    createFile(name, content = '') {
        const file = new File(name, content);
        this.files.push(file);
    }

    deleteFile(name) {
        this.files = this.files.filter(file => file.name !== name);
    }

    getFile(name) {
        return this.files.find(file => file.name === name);
    }

    updateFile(name, content) {
        const file = this.getFile(name);
        if (file) {
            file.content = content;
        }
    }
}
export default Project;
