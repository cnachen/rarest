class UUIDVar {
  constructor(uuid) {
    this.uuid = uuid;
    this.load();
  }

  update(newUuid) {
    this.uuid = newUuid;
    this.load();
  }

  load() {
    const storedVars = localStorage.getItem(`vars_${this.uuid}`);
    this.vars = storedVars ? JSON.parse(storedVars) : {};
  }

  store() {
    localStorage.setItem(`vars_${this.uuid}`, JSON.stringify(this.vars));
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

export { UUIDVar };
