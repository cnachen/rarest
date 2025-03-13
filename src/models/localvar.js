class LocalVar {
    constructor() {
        this.load();
    }

    load() {
        const storedVars = localStorage.getItem('vars');
        this.vars = storedVars ? JSON.parse(storedVars) : {};
    }

    store() {
        localStorage.setItem('vars', JSON.stringify(this.vars));
    }

    getVar(name) {
        return this.vars[name];
    }

    setVar(name, value) {
        this.vars[name] = value;
        this.store();
    }

    delVar(name) {
        delete this.vars[name];
        this.store();
    }   
}

export { LocalVar };