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
        this.files = storedProjectInner ? JSON.parse(storedProjectInner).files : [new File('entry.S', `.global _entry
.section .text
_entry:
    mv s0, zero
    mv t0, zero
    mv t1, zero
    li t2, 0xf
    slli t2, t2, 0x3c
1:
    beq s0, t2, 1f
    sll s0, t0, t1
    addi t0, t0, 1
    addi t1, t1, 4

    j 1b
1:
    j .

.section .rodata
msg:
	.ascii "Hello, World!\\n"`)];
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

    updateDecompiled(decompiled) {
        this.decompiled = decompiled;
        this.store();
    }
}

export { Project, ProjectInner };
