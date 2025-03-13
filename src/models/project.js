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
	auipc t1, 0xab
	li t1, 0xfff
	addi t0, zero, 0
	j 2f
1:
	addi t0, t0, 1
	j 1b
2:
	la t0, _entry
	lw t1, 0(t0)
	srli t0, t1, 12
	addi t0, t0, 1
	slli t0, t0, 12
	li t2, 0xfff
	and t1, t1, t2
	or t0, t1, t0
	la t1, _entry
	sw t0, 0(t1)
	addi t0, zero, 0
	j _entry

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
