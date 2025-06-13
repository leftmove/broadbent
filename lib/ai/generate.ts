import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// This script's purpose is hacky as hell.
// Because Convex uses its own type checker, rather than the loader setup in Webpack, the YAML has to be imported from TypeScript.
// This script reads the YAML files, converts them to JSON, and then generates a TypeScript file that exports the models.
// This is then imported into the models.ts file.

const inputDir = path.resolve(__dirname, "./models");
const outputFile = path.resolve(__dirname, "./spec.ts");

function readYamls(): Record<string, any> {
  const files = fs.readdirSync(inputDir).filter((f) => /\.ya?ml$/.test(f));
  return Object.fromEntries(
    files.map((file) => {
      const id = path.basename(file, path.extname(file));
      const raw = fs.readFileSync(path.join(inputDir, file), "utf8");
      const parsed = yaml.load(raw);
      return [id, parsed];
    })
  );
}

function generateTS(data: Record<string, any>): string {
  const header = `// AUTO-GENERATED FILE. DO NOT EDIT.\n\nimport type { ModelYAML } from "./models";\n`;
  const exports = Object.entries(data).map(([key, val]) => {
    const ts = JSON.stringify(val, null, 2).replace(/"([^"]+)":/g, "$1:");
    return `export const ${key}: ModelYAML = ${ts} as const;`;
  });
  const indexExport = `\nexport const modelSpecs = { ${Object.keys(data).join(", ")} } as const;`;
  return [header, ...exports, indexExport, ""].join("\n\n");
}

const data = readYamls();
const tsContent = generateTS(data);
fs.writeFileSync(outputFile, tsContent, "utf8");
console.log("Generated model specification in ", outputFile);
