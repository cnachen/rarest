import File from "./file";
import { UUIDVar } from "./uuidvar";

class Project {
  constructor(name, uuid, template = "default") {
    this.name = name;
    this.uuid = uuid;
    this.template = template;

    const uuidVar = new UUIDVar(uuid);
    uuidVar.setVar("template", template);
  }
}

class ProjectInner {
  constructor(uuid) {
    this.uuid = uuid;
    this.load();
    this.store();
  }

  load() {
    const uuidVar = new UUIDVar(this.uuid);
    const template = uuidVar.getVar("template");

    const storedProjectInner = localStorage.getItem(
      `projectInner_${this.uuid}`
    );
    if (template === "fact") {
      this.files = storedProjectInner
        ? JSON.parse(storedProjectInner).files
        : [
            new File(
              "entry.S",
              `.global _entry
.section .text

_entry:
    li   t0, 5        # t0 = 5 (n)
    li   t1, 1        # t1 = 1 (result)

factorial_loop:
    beqz t0, done     # if t0 == 0, jump to done
    mul  t1, t1, t0   # t1 = t1 * t0
    addi t0, t0, -1   # t0 = t0 - 1
    j factorial_loop

done:
    j .
`
            ),
          ];
    }
    else if (template === "fib") {
      this.files = storedProjectInner
        ? JSON.parse(storedProjectInner).files
        : [
            new File(
              "entry.S",
              `.global _entry
.section .text
_entry:
    li a0, 5
    call fib
    j .                # goto .

.section .rodata
msg:
	.ascii "Hello, World!\\n"
`
            ),
            new File(
              "fib.c",
              `int fib(int n)
{
    if (n <= 1) return 1;
    return fib(n - 1) + fib(n - 2);
}
`
            ),
          ];
    } else {
      this.files = storedProjectInner
        ? JSON.parse(storedProjectInner).files
        : [
            new File(
              "entry.S",
              `.global _entry
.section .text
_entry:
    mv s0, zero        # s0 = zero
    mv t0, zero        # t0 = zero
    mv t1, zero        # t1 = zero
    li t2, 0xf         # t2 = 0xf
    slli t2, t2, 0x3c  # t2 = t2 << 60
1:
    beq s0, t2, 1f     # if (s0 == t2) goto 1f
    sll s0, t0, t1     # s0 = t0 << t1
    addi t0, t0, 1     # t0 = t0 + 1
    addi t1, t1, 4     # t1 = t1 + 4
    j 1b               # goto 1b
1:
    j .                # goto .

.section .rodata
msg:
	.ascii "Hello, World!\\n"
`
            ),
          ];
    }
    this.config = storedProjectInner
      ? JSON.parse(storedProjectInner).config
      : {};
    this.items = storedProjectInner ? JSON.parse(storedProjectInner).items : [];
    this.decompiled = storedProjectInner
      ? JSON.parse(storedProjectInner).decompiled
      : "";
  }

  store() {
    localStorage.setItem(`projectInner_${this.uuid}`, JSON.stringify(this));
  }

  createFile(name, content = "") {
    const file = new File(name, content);
    this.files.push(file);
    this.store();
  }

  deleteFile(name) {
    this.files = this.files.filter((file) => file.name !== name);
    this.store();
  }

  getFile(name) {
    return this.files.find((file) => file.name === name);
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
