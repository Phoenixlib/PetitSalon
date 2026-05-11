const fs = require('fs');
let code = fs.readFileSync('src/app/admin/servicios/actions.ts', 'utf8');

code = code.replace(/description: \(formData\.get\("description"\) as string\) \|\| null,\n\s*categoryId: \(formData\.get\("categoryId"\) as string\) \|\| null,\n\s*};/g, 
`description: (formData.get("description") as string) || null,
      categoryId: (formData.get("categoryId") as string) || null,
      calComLink: (formData.get("calComLink") as string) || null,
    };`);

fs.writeFileSync('src/app/admin/servicios/actions.ts', code);
