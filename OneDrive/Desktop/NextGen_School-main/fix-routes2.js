const fs = require("fs");
function fixFile(file) {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(/\\\`/g, "\`").replace(/\\\$\{/g, "\$\{");
  fs.writeFileSync(file, content, "utf8");
}
fixFile("app/api/admin/teacher/[id]/route.ts");
fixFile("app/api/admin/institute/[id]/route.ts");
fixFile("app/api/admin/course/[id]/route.ts");
