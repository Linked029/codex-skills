/**
 * PDF → Markdown 批量转换脚本
 *
 * 用法:
 *   node scripts/convert-pdfs.mjs                    ← 转 knowledge-base/books/ 下所有 PDF
 *   node scripts/convert-pdfs.mjs --source D:\books  ← 指定源目录
 *   node scripts/convert-pdfs.mjs --dest D:\output   ← 指定输出目录
 *
 * 输出: 每个 PDF 生成同名的 .md 文件
 *       图片不支持内嵌，会被跳过（文本完全保留）
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from 'fs';
import { join, extname, basename, parse } from 'path';
import pdfParse from 'pdf-parse';
import { homedir } from 'os';

const SRC = process.argv.find(a=>a.startsWith('--source='))?.slice(8) || join(homedir(),'knowledge-base','books');
const DST = process.argv.find(a=>a.startsWith('--dest='))?.slice(6) || SRC;

if (!existsSync(SRC)) { console.error('源目录不存在:', SRC); process.exit(1); }
if (!existsSync(DST)) mkdirSync(DST, { recursive: true });

const pdfs = readdirSync(SRC).filter(f => f.toLowerCase().endsWith('.pdf'));
console.log(`找到 ${pdfs.length} 个 PDF 文件`);

let converted = 0;
for (const pdfFile of pdfs) {
    const pdfPath = join(SRC, pdfFile);
    const mdName = basename(pdfFile, '.pdf') + '.md';
    const mdPath = join(DST, mdName);

    if (existsSync(mdPath) && !process.argv.includes('--force')) {
        console.log(`  ⏭ 跳过(已存在): ${mdName}`);
        continue;
    }

    process.stdout.write(`  ⏳ 转换: ${pdfFile}... `);
    try {
        const buf = readFileSync(pdfPath);
        const data = await pdfParse(buf);

        // 组装 Markdown
        let md = `# ${basename(pdfFile, '.pdf')}\n\n`;
        md += `> 源文件: ${pdfFile}\n`;
        md += `> 页数: ${data.numpages}\n`;
        md += `> 提取于: ${new Date().toISOString().slice(0,10)}\n\n`;
        md += `---\n\n`;
        md += data.text;

        writeFileSync(mdPath, md, 'utf-8');
        console.log(`✅ ${data.numpages}页 → ${(data.text.length/1000).toFixed(0)}KB`);
        converted++;
    } catch (e) {
        console.log(`❌ ${e.message.slice(0,80)}`);
    }
}

console.log(`\n完成！共转换 ${converted}/${pdfs.length} 个文件`);
